# Build 6A Complete

Foundation upgrade: progression platform on top of existing capture → analysis → results flow.

## Implemented

### Migration #4
`supabase/migrations/20250610120000_build_6a_progression_foundation.sql`

- `analysis_history` normalized columns + indexes
- `profiles` progression aggregates
- `visual_dna` table + RLS

**Apply to live project:**
```bash
cd /Users/jfair/fairframe
npx supabase db push
```

### Types
- `src/types/database.ts` — profiles, analysis_history, visual_dna
- `src/types/fairLevel.ts` — FairLevel ladder + classifications
- `src/types/visualDNA.ts`
- `src/types/analysis.ts` — progression fields on `ChiefAnalysisResult`

### Services
- `src/services/fairLevel.ts` — classification, rolling avg, level compute
- `src/services/visualDNA.ts` — merge + upsert archetype DNA
- `src/services/progression.ts` — normalized save fields, profile updates
- `src/services/analysisHistory.ts` — insert normalized columns + async progression
- `src/services/parseChiefResponse.ts` — derives classification, strengths, drivers

### Screens
- `app/progress.tsx` — FairLevel ladder + stats
- `app/dna.tsx` — Visual DNA archetype + traits
- `app/profile.tsx` — account summary + nav

### Navigation
- Signed-in links on Home (`app/index.tsx`) and Results (`app/results.tsx`)
- `src/lib/appRoutes.ts` for typed routes

### Cleanup
- Removed unused `ChiefObservation.tsx`, `ScoreRing.tsx`

## Preserved (unchanged)
- Live Chief edge function + founder gates
- Auth, capture, upload, loading, results flow
- Sprint 4 results UI

## Manual test plan
1. Sign in with founder email → capture frame → results unchanged
2. After save, open **My Progress** — frames count increments, rolling avg updates
3. Open **Visual DNA** — archetype + strengths after 1+ saves
4. Guest/skip path — no progression nav on home; capture still works
5. Sign out from Profile

## Deferred (Build 6B+)
- Tab bar navigation
- Edge prompt changes for server-side normalized fields
- History list UI, cards, subscriptions, achievements
