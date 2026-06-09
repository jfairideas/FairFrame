# Build 6A Implementation Plan

**Directive:** Foundation upgrade — analysis app → progression platform  
**No out-of-scope:** cards, subscriptions, achievements, Fair Circle workflow, public profiles, Top 100, image storage

## Phase 0 — Planning (this document)

| Section | Files |
|---------|-------|
| Migration #4 | `supabase/migrations/20250610120000_build_6a_progression_foundation.sql` |
| Types | `src/types/database.ts`, `src/types/fairLevel.ts`, `src/types/visualDNA.ts`, `src/types/analysis.ts` |
| Services | `src/services/fairLevel.ts`, `src/services/visualDNA.ts`, `src/services/progression.ts`, `src/services/analysisHistory.ts` |
| Parser | `src/services/parseChiefResponse.ts` |
| Screens | `app/progress.tsx`, `app/dna.tsx`, `app/profile.tsx` |
| Navigation | `app/index.tsx`, `app/results.tsx` |
| Cleanup | delete `ChiefObservation.tsx`, `ScoreRing.tsx` |

## Conflicts & resolutions

| Conflict | Resolution |
|----------|------------|
| `chiefsReaction` vs `chiefReaction` in spec | Keep `chiefsReaction` in UI; map to DB column `chief_reaction` |
| `analysis_history_user_created_idx` exists | Migration uses `IF NOT EXISTS` |
| No hooks folder | Not required for 6A |
| Tabs vs stack | Defer tabs; add nav buttons on Home + Results (Build 6B) |
| Edge prompt unchanged | Parser derives progression fields client-side; edge optional later |

## Risks

- Post-save progression failure → non-blocking (log only)
- Old rows lack normalized columns → screens handle nulls
- Founder gate unchanged → no edge changes in 6A

## Testing

- Capture/upload → results unchanged
- Signed-in save populates new columns
- FairLevel thresholds: 0, 50, 200, 500+avg, 1000+avg, 2500+avg
- Progress/DNA/Profile empty states
- RLS: visual_dna owner-only
