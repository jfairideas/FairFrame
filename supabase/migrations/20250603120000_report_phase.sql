-- Align analysis_history with Founder Bible report phases

alter table public.analysis_history
  drop constraint if exists analysis_history_analysis_mode_check;

alter table public.analysis_history
  add constraint analysis_history_analysis_mode_check
  check (analysis_mode in ('initial', 'enhanced', 'visual', 'story-aware'));
