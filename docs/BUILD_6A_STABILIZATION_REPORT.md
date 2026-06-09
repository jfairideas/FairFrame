# Build 6A Stabilization Report

**Date:** June 2026  
**Scope:** Fix pass only — no Build 6B features

---

## A. Migration #4 Status

### Before fix
- Live Supabase (`eaficgjjvtekrqcxlaoy`) had **3 migrations only** — Build 6A schema was **not applied**.
- Missing: all `profiles` progression columns, all `analysis_history` normalized columns, `visual_dna` table.

### After fix
- **Applied live** via Supabase MCP `apply_migration` (`build_6a_progression_foundation`).
- Verified live schema includes:
  - `profiles`: `current_fair_level`, `total_frames_analyzed`, `rolling_average_fair_score`, `highest_fair_score`, `best_classification`, `is_premium`, `is_founding_member`, `is_fair_circle_member`
  - `analysis_history`: all 10 normalized Build 6A columns + indexes
  - `visual_dna` table with RLS policies
- **Non-destructive** — additive `ALTER` / `CREATE IF NOT EXISTS` only. Existing 4 history rows and 1 profile preserved.

### Local CLI note
If your local Supabase CLI is not linked, run once:

```bash
cd /Users/jfair/fairframe
npx supabase link --project-ref eaficgjjvtekrqcxlaoy
npx supabase migration list
```

Live is already migrated; linking keeps local migration history in sync.

---

## B. Files Changed

| File | Change |
|------|--------|
| `src/services/progression.ts` | All-time `highest_fair_score`; history-based `best_classification` |
| `src/types/fairLevel.ts` | Added `EARNABLE_FAIR_LEVEL_REQUIREMENTS` (excludes Fair Circle from ladder) |
| `app/progress.tsx` | Earnable ladder only; Fair Circle invite-only footer; "Lifetime best" label |
| `app/dna.tsx` | Premium locked placeholder sections; free tier = archetype + badges + strengths + subject lean |
| `src/types/database.ts` | Added `chief_daily_usage` and `chief_request_dedup` types |
| `docs/BUILD_6B_IMAGE_STRATEGY.md` | **NEW** — session-local image strategy for 6B |
| `docs/BUILD_6A_STABILIZATION_REPORT.md` | **NEW** — this report |

**Not changed:** edge function, `chief.ts`, `analysis-loading.tsx`, `results.tsx`, auth, founder gates.

---

## C. highest_fair_score Fix

### Before (incorrect)
```typescript
const highest = scores.length > 0 ? Math.max(...scores) : result.fairScore;
```
Used max of **last 100** `fair_score` rows only.

### After (correct)
```typescript
async function fetchAllTimeHighestFairScore(userId) {
  // ORDER BY fair_score DESC LIMIT 1 — all scored analyses
}
const highest = Math.max(allTimeHighest ?? 0, result.fairScore);
```

- **`rolling_average_fair_score`** — unchanged; still last 100 scored analyses.
- **`best_classification`** — now merges: stored profile value + all `classification` values in history + classification derived from lifetime highest score.
- **Progress UI** — label changed from "Best score" to **"Lifetime best"**.

**Expected:** User with old 9.4 and recent 8.0 scores shows `highest_fair_score = 9.4`.

---

## D. Smoke-Test Result

### Code inspection: **PASS** (pending your device confirmation)

Signed-in flow from code:

1. `login` → auth session (non-anonymous)
2. `capture` / `upload` → `SessionContext` holds `imageUri`
3. `analysis-loading` → `analyzeWithChief` → `setResult` → **`saveAnalysisHistory`** → `router.replace("/results")`
4. `saveAnalysisHistory`:
   - Inserts row with normalized Build 6A columns
   - Fires `void runPostAnalysisProgression` (non-blocking)
5. `runPostAnalysisProgression`:
   - `updateProfileAfterAnalysis` (frames, rolling avg, lifetime best, level)
   - `recalculateVisualDNA` (upsert `visual_dna`)
6. Results screen renders **before** progression completes — Sprint 4 happy path preserved
7. Progress / DNA / Profile fetch from `profiles` + `visual_dna` — will not crash on nulls

### Manual steps for you

1. `npx expo start --clear`
2. Sign in with `austinfairtt@gmail.com` (not guest, not skip)
3. Capture or upload one frame
4. Wait for results — confirm Chief's Report appears
5. Tap **My Progress** — frames ≥ 1, rolling avg populated, lifetime best shown
6. Tap **Visual DNA** — archetype/badges after first save; premium sections show locked placeholders
7. Tap **Profile** — level + archetype summary

### Guest / skip path

- Still works without progression save (`analysisHistory` returns early for anonymous)
- No regression to Sprint 4 results UI

### Pre-6A history rows

- 4 existing rows lack `fair_score` — they count toward `total_frames_analyzed` but not rolling avg until new scored saves occur. Expected.

---

## E. Build 6B Image Strategy

- **Documented:** `docs/BUILD_6B_IMAGE_STRATEGY.md`
- **Decision:** Session-local `SessionContext.imageUri` first
- **Confirmed:** No storage buckets, no permanent image hosting, no gallery tables added

---

## F. Remaining Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Progression race (open Progress before post-save finishes) | Low | Refresh by leaving and re-entering screen |
| Silent progression failures (`console.warn` only) | Low | Consider toast in 6B if needed |
| Pre-6A rows without `fair_score` | Low | Rolling avg ignores until new saves |
| Local Supabase CLI not linked | Low | Live DB is migrated; link for dev convenience |
| `fair_score_trend` still not computed | Low | Deferred |
| Premium DNA sections are placeholders only | Info | No payment integration |

---

## G. CTO Recommendation

**Is Build 6A safe to treat as complete?**  
**Yes** — after you run the manual smoke test above on device. Migration is live; critical logic bug is fixed; image strategy is documented.

**Is it safe to begin Build 6B?**  
**Yes** — proceed with the Build 6B Codebase-Aware Implementation Directive. Start with PRESS CARD using session-local image per `BUILD_6B_IMAGE_STRATEGY.md`.

**Do not start 6B until:** One signed-in capture on your phone confirms Progress/DNA update (5-minute manual check).

---

*End of Build 6A Stabilization Report*
