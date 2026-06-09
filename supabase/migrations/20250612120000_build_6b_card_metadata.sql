-- Build 6B: card verification metadata (no image storage)

create table if not exists public.fair_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  analysis_id uuid references public.analysis_history (id) on delete set null,
  card_type text not null check (card_type in ('frame', 'press', 'milestone', 'signature')),
  display_serial text not null unique,
  fair_score numeric,
  card_classification text,
  fair_level_at_creation text,
  creator_display_name text,
  source_image_strategy text not null default 'session-local',
  card_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists fair_cards_user_created_idx
  on public.fair_cards (user_id, created_at desc);

alter table public.fair_cards enable row level security;

create policy "Users can read own cards"
  on public.fair_cards for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.fair_cards for insert
  with check (auth.uid() = user_id);
