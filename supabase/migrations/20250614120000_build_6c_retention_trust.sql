-- Build 6C: retention, trust, progression integrity, ethics layer

-- Ethics screenings (no image storage)
create table if not exists public.ethics_screenings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  safety_tier text not null check (safety_tier in ('green', 'yellow', 'red')),
  reason_code text not null,
  analysis_allowed boolean not null default false,
  recognition_allowed boolean not null default false,
  card_allowed boolean not null default false,
  progress_allowed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ethics_screenings_user_created_idx
  on public.ethics_screenings (user_id, created_at desc);

alter table public.ethics_screenings enable row level security;

create policy "Users can read own ethics screenings"
  on public.ethics_screenings for select
  using (auth.uid() = user_id);

-- Milestone foundation (scaffold only)
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  milestone_key text not null,
  achieved_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (user_id, milestone_key)
);

create index if not exists milestones_user_idx on public.milestones (user_id, achieved_at desc);

alter table public.milestones enable row level security;

create policy "Users can read own milestones"
  on public.milestones for select
  using (auth.uid() = user_id);

create policy "Users can insert own milestones"
  on public.milestones for insert
  with check (auth.uid() = user_id);

-- Analytics events (calibration infrastructure)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_created_idx
  on public.analytics_events (event_name, created_at desc);

alter table public.analytics_events enable row level security;

create policy "Users can insert own analytics events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id);

create policy "Users can read own analytics events"
  on public.analytics_events for select
  using (auth.uid() = user_id);

-- Analysis history ethics metadata
alter table public.analysis_history
  add column if not exists safety_tier text check (safety_tier in ('green', 'yellow', 'red')),
  add column if not exists ethics_reason_code text,
  add column if not exists recognition_allowed boolean default true,
  add column if not exists progress_contributed boolean default true;

-- Read-safe daily usage for signed-in users
create or replace function public.get_my_daily_analysis_usage(p_display_limit int default 15)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_date date := (timezone('utc', now()))::date;
  v_count int := 0;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', 'Not signed in');
  end if;

  select coalesce(analysis_count, 0)
  into v_count
  from public.chief_daily_usage
  where user_id = v_user and usage_date = v_date;

  return jsonb_build_object(
    'ok', true,
    'used', v_count,
    'limit', p_display_limit,
    'remaining', greatest(0, p_display_limit - v_count)
  );
end;
$$;

revoke all on function public.get_my_daily_analysis_usage(int) from public;
grant execute on function public.get_my_daily_analysis_usage(int) to authenticated;
