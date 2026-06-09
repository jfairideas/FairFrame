# FairFrame Build 6C — Retention, Trust, and Progression Integrity

**Directive:** `FAIRFRAME_BUILD_6C_FOUNDER_LOCKED_MASTER_DIRECTIVE.pdf`  
**Date:** 2025-06-08  
**Theme:** Retention + Trust + Progression Integrity

---

## Summary

Build 6C makes FairFrame a **retention-driven visual growth platform** with ethical guardrails. Users see their journey, understand daily analysis value, advance through **FairScore-weighted FairLevel**, and hit an **Ethics Layer** before Chief analysis.

---

## Workstreams Implemented

### A. Progress Widget
- `src/components/progress/ProgressWidget.tsx` (compact + expanded)
- Placed on **Home**, **Results**, **Profile**, **Progress**
- Shows: FairLevel, frames analyzed, rolling avg, next-level path
- Guest: “Sign in to track your progress.”

### B. Journey Bar
- `src/components/progress/JourneyBar.tsx`
- Observer → Storyteller → Visual Journalist → Craftsman → Master → Chief Approved
- Current level highlighted; Fair Circle hidden (invite-only note)

### C. Analysis Remaining Indicator
- `src/components/usage/AnalysisRemainingPill.tsx`
- Copy: `Today: 3 / 15 analyses used` (calm, non-predatory)
- Home, Upload, Progress; limit-reached message without billing

### D. FairScore-Weighted Progression
- Provisional thresholds in `src/types/fairLevel.ts`:
  - Storyteller: 50 frames + 5.0 avg
  - Visual Journalist: 150 + 5.8
  - Craftsman: 400 + 6.5
  - Master: 1000 + 7.2
  - Chief Approved: 2500 + 8.5 (special)
- `LevelRequirementCard` shows frame + avg gates
- Hint when frames met but avg not: “Raise your rolling average to continue.”

### E. FairFrame Ethics Layer
- Server: `supabase/functions/analyze-frame/ethicsScreen.ts` — screens **before** Chief
- Red: no Chief, no score, no card, no progression (`/ethics-refusal`)
- Yellow: analysis proceeds; recognition/cards limited
- Green: full flow
- Client: ethics metadata on session; Results shows `EthicsNotice`; PRESS CARD gated

### F. Milestone Foundation + Analytics
- `milestones` table + `src/services/milestones.ts`
- `analytics_events` table + `src/services/analytics.ts`
- Events: analysis_started, ethics_*, progress_widget_viewed, journey_bar_viewed, etc.

---

## Database Migration

**File:** `supabase/migrations/20250614120000_build_6c_retention_trust.sql`  
**Live:** `build_6c_retention_trust` applied to `eaficgjjvtekrqcxlaoy`

New tables: `ethics_screenings`, `milestones`, `analytics_events`  
New columns on `analysis_history`: `safety_tier`, `ethics_reason_code`, `recognition_allowed`, `progress_contributed`  
RPC: `get_my_daily_analysis_usage(p_display_limit)`

---

## Feature Flags

`src/config/build6c.ts` — all enabled by default; disable for rollback.

---

## Edge Function Deploy Required

Ethics screening is in `analyze-frame`. Deploy updated function:

```bash
cd /Users/jfair/fairframe && npx supabase functions deploy analyze-frame
```

---

## Preserved (Not Changed)

- Press Card V2 ceremony system
- Card metadata dedup
- Visual DNA recalculation
- Live Chief prompt (Chief analysis unchanged after ethics pass)
- No Storage, Stripe, social, Top 100, public profiles

---

## Manual Device Tests

| Test | Expected |
|------|----------|
| New signed-in user | Home shows Observer + Journey Bar |
| After analysis | Results shows Progress Widget |
| Yellow ethics (simulated) | Sensitive notice; PRESS CARD limited |
| Red ethics (simulated) | `/ethics-refusal` — no score shown |
| Green analysis | Normal results + card + progression |
| Journey Bar | All levels visible, current highlighted |
| Daily usage pill | Shows used/remaining |
| Build 6B regression | Eligible image → PRESS CARD works |

---

## Remaining Risks

1. **Edge function must be deployed** for live ethics screening
2. **Ethics false positives/negatives** — calibrate with founder review
3. **Provisional thresholds** — need real score distribution data
4. **Device smoke test** — not run in this sprint

---

## Changed Files (Primary)

```
src/config/build6c.ts
src/types/ethics.ts, progressionStatus.ts, fairLevel.ts, database.ts
src/services/progressionStatus.ts, dailyUsage.ts, ethicsLayer.ts, analytics.ts, milestones.ts
src/services/chief.ts, analysisHistory.ts, progression.ts
src/components/progress/*, usage/AnalysisRemainingPill.tsx, ethics/EthicsNotice.tsx
app/index.tsx, results.tsx, progress.tsx, profile.tsx, upload.tsx
app/analysis-loading.tsx, ethics-refusal.tsx
supabase/functions/analyze-frame/index.ts, ethicsScreen.ts
supabase/migrations/20250614120000_build_6c_retention_trust.sql
docs/BUILD_6C_COMPLETE.md
```

---

## Definition of Done Status

| Criterion | Status |
|-----------|--------|
| Retention UI (Widget + Journey) | Implemented |
| Daily analysis visibility | Implemented |
| Weighted progression | Implemented (provisional) |
| Ethics before Chief | Implemented (deploy required) |
| Build 6A/6B preserved | Code-level yes |
| Device proven | **Pending founder** |

**Build 6C is code-complete. Founder device pass + edge deploy required for lock.**
