-- Live Chief usage limits (service-role only; no client policies)

create table if not exists public.chief_daily_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  analysis_count int not null default 0,
  last_request_at timestamptz,
  primary key (user_id, usage_date)
);

alter table public.chief_daily_usage enable row level security;

create table if not exists public.chief_request_dedup (
  request_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.chief_request_dedup enable row level security;

create index if not exists chief_request_dedup_created_idx
  on public.chief_request_dedup (created_at);

-- Atomically reserve a slot before calling OpenAI (founder-only enforced in edge function)
create or replace function public.reserve_chief_analysis(
  p_user_id uuid,
  p_max_daily int default 20,
  p_min_interval_seconds int default 15
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date date := (timezone('utc', now()))::date;
  v_count int;
  v_last timestamptz;
begin
  insert into public.chief_daily_usage (user_id, usage_date, analysis_count)
  values (p_user_id, v_date, 0)
  on conflict (user_id, usage_date) do nothing;

  select analysis_count, last_request_at
  into v_count, v_last
  from public.chief_daily_usage
  where user_id = p_user_id and usage_date = v_date
  for update;

  if v_last is not null
    and v_last > now() - make_interval(secs => p_min_interval_seconds)
  then
    return jsonb_build_object(
      'ok', false,
      'code', 'rate_limited',
      'message', 'Please wait before running another Live Chief analysis'
    );
  end if;

  if v_count >= p_max_daily then
    return jsonb_build_object(
      'ok', false,
      'code', 'daily_limit',
      'message', format('Daily Live Chief limit reached (%s/day)', p_max_daily)
    );
  end if;

  update public.chief_daily_usage
  set
    analysis_count = analysis_count + 1,
    last_request_at = now()
  where user_id = p_user_id and usage_date = v_date;

  return jsonb_build_object('ok', true, 'remaining', p_max_daily - v_count - 1);
end;
$$;

revoke all on function public.reserve_chief_analysis(uuid, int, int) from public;
revoke all on function public.reserve_chief_analysis(uuid, int, int) from anon;
revoke all on function public.reserve_chief_analysis(uuid, int, int) from authenticated;
