-- Build 6A: progression foundation (additive only)

-- Normalized analysis metadata (result JSONB preserved)
alter table public.analysis_history
  add column if not exists fair_score numeric,
  add column if not exists classification text,
  add column if not exists image_type text,
  add column if not exists category text,
  add column if not exists chief_reaction text,
  add column if not exists chief_assignment text,
  add column if not exists detected_strengths jsonb default '[]'::jsonb,
  add column if not exists detected_weaknesses jsonb default '[]'::jsonb,
  add column if not exists attention_drivers jsonb default '[]'::jsonb,
  add column if not exists fair_level_at_capture text;

create index if not exists analysis_history_user_score_idx
  on public.analysis_history (user_id, fair_score desc);

-- user_created index may already exist from init migration
create index if not exists analysis_history_user_created_idx
  on public.analysis_history (user_id, created_at desc);

-- Profile progression aggregates
alter table public.profiles
  add column if not exists current_fair_level text default 'Observer',
  add column if not exists total_frames_analyzed integer default 0,
  add column if not exists rolling_average_fair_score numeric default 0,
  add column if not exists highest_fair_score numeric default 0,
  add column if not exists best_classification text,
  add column if not exists is_premium boolean default false,
  add column if not exists is_founding_member boolean default false,
  add column if not exists is_fair_circle_member boolean default false;

-- Visual DNA identity layer
create table if not exists public.visual_dna (
  user_id uuid primary key references auth.users (id) on delete cascade,
  dominant_archetype text default 'The Observer',
  trait_badges jsonb default '[]'::jsonb,
  subject_preferences jsonb default '{}'::jsonb,
  composition_preferences jsonb default '{}'::jsonb,
  light_preferences jsonb default '{}'::jsonb,
  attention_drivers jsonb default '{}'::jsonb,
  top_strengths jsonb default '[]'::jsonb,
  growth_areas jsonb default '[]'::jsonb,
  fair_score_trend text,
  last_recalculated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.visual_dna enable row level security;

create policy "Users can read own visual dna"
  on public.visual_dna for select
  using (auth.uid() = user_id);

create policy "Users can insert own visual dna"
  on public.visual_dna for insert
  with check (auth.uid() = user_id);

create policy "Users can update own visual dna"
  on public.visual_dna for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
