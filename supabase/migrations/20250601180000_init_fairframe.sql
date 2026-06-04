-- FairFrame: profiles + analysis history with RLS

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: users read own row"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: users insert own row"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles: users update own row"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  analysis_mode text not null check (analysis_mode in ('initial', 'enhanced', 'visual', 'story-aware')),
  scene_type text not null check (scene_type in ('subject-present', 'location-scout')),
  story_context jsonb,
  result jsonb not null,
  source text not null default 'mock',
  created_at timestamptz not null default now()
);

create index if not exists analysis_history_user_created_idx
  on public.analysis_history (user_id, created_at desc);

alter table public.analysis_history enable row level security;

create policy "Analysis history: users read own rows"
  on public.analysis_history for select
  using (auth.uid() = user_id);

create policy "Analysis history: users insert own rows"
  on public.analysis_history for insert
  with check (auth.uid() = user_id);

create policy "Analysis history: users delete own rows"
  on public.analysis_history for delete
  using (auth.uid() = user_id);
