# FairFrame Build 6A Post-Implementation Audit

**Mode:** Read-only inspection — no code, files, or schema were modified during the audit.  
**Repo:** `/Users/jfair/fairframe`  
**GitHub:** https://github.com/jfairideas/FairFrame  
**Supabase project:** `eaficgjjvtekrqcxlaoy` (live)  
**Compared against:** Pre-6A audit (`docs/FAIRFRAME_CODEBASE_AUDIT_V2.md`) + Build 6A directive  
**Audit date:** June 2026

---

## 1. Build 6A Completion Summary

Build 6A adds a **progression foundation** on top of the existing Sprint 4 analysis app: normalized history columns, profile aggregates, Visual DNA, three new screens, and post-save hooks — without cards, subscriptions, or social features.

| Area | What was implemented |
|------|------------------------|
| **Database** | Migration #4: additive columns on `profiles` and `analysis_history`; new `visual_dna` table + RLS |
| **New migration** | `20250610120000_build_6a_progression_foundation.sql` |
| **New table** | `visual_dna` |
| **Modified tables** | `profiles` (+7 progression columns), `analysis_history` (+10 normalized columns, +1 index) |
| **New screens** | `app/progress.tsx`, `app/dna.tsx`, `app/profile.tsx` |
| **New routes** | `/progress`, `/dna`, `/profile` |
| **New services** | `fairLevel.ts`, `visualDNA.ts`, `progression.ts` |
| **New lib** | `appRoutes.ts` (typed route constants) |
| **New types** | `fairLevel.ts`, `visualDNA.ts`; expanded `database.ts`, `analysis.ts` |
| **New components** | None — reuses `Screen`, `Card`, `Button`, `Label`, `ListSection` |
| **Modified files** | `analysisHistory.ts`, `parseChiefResponse.ts`, `index.tsx`, `results.tsx` |
| **Removed** | `ChiefObservation.tsx`, `ScoreRing.tsx` |
| **Unchanged** | Edge function, founder gates, capture flow, Sprint 4 results UI |

---

## 2. New Project Tree

```
fairframe/
├── app/                              # 12 routes (+3 from pre-6A)
│   ├── _layout.tsx
│   ├── index.tsx                     # MODIFIED — progression nav when signed in
│   ├── login.tsx
│   ├── camera-permission.tsx
│   ├── capture.tsx
│   ├── upload.tsx
│   ├── analysis-loading.tsx
│   ├── results.tsx                   # MODIFIED — progression nav
│   ├── progress.tsx                  # NEW
│   ├── dna.tsx                       # NEW
│   ├── profile.tsx                   # NEW
│   └── auth/callback.tsx
├── src/
│   ├── components/                   # 10 files (was 12; 2 deleted)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Screen.tsx
│   │   ├── Label.tsx
│   │   ├── ListSection.tsx
│   │   ├── FairScoreCard.tsx
│   │   ├── ExpandableFullAnalysis.tsx
│   │   ├── ChiefSourceBanner.tsx
│   │   ├── PillarScores.tsx
│   │   └── WhatChiefSees.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── SessionContext.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── authSession.ts
│   │   ├── liveChiefAccess.ts
│   │   └── appRoutes.ts              # NEW
│   ├── services/                     # 8 files (+3)
│   │   ├── chief.ts
│   │   ├── mockChief.ts
│   │   ├── parseChiefResponse.ts     # MODIFIED
│   │   ├── chiefPrompt.ts
│   │   ├── analysisHistory.ts        # MODIFIED
│   │   ├── fairLevel.ts              # NEW
│   │   ├── visualDNA.ts              # NEW
│   │   └── progression.ts            # NEW
│   ├── theme/                        # unchanged
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   ├── types/                        # 4 files (+2)
│   │   ├── analysis.ts               # MODIFIED
│   │   ├── database.ts               # MODIFIED
│   │   ├── fairLevel.ts              # NEW
│   │   └── visualDNA.ts              # NEW
│   └── utils/                        # unchanged
│       ├── fairScore.ts
│       ├── imageType.ts
│       ├── labels.ts
│       └── pillars.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/                   # 4 files (+1)
│   │   ├── 20250601180000_init_fairframe.sql
│   │   ├── 20250603120000_report_phase.sql
│   │   ├── 20250604120000_chief_daily_usage.sql
│   │   └── 20250610120000_build_6a_progression_foundation.sql  # NEW
│   └── functions/analyze-frame/      # unchanged
│       ├── index.ts
│       ├── chiefPrompt.ts
│       └── chiefGuard.ts
├── docs/
│   ├── BUILD_6A_IMPLEMENTATION_PLAN.md
│   ├── BUILD_6A_COMPLETE.md
│   ├── FAIRFRAME_CODEBASE_AUDIT_V2.md
│   └── BUILD_6A_POST_IMPLEMENTATION_AUDIT.md  # this document
├── scripts/
│   ├── set-founder-secrets.sh
│   ├── set-openai-secret.sh
│   └── generate-icons.mjs
└── ...
```

**Still absent:** `hooks/`, root-level `components/`, history list UI, tab navigation.

---

## 3. Database Schema After Build 6A

### `profiles` (changed)

| Column | Type | Build 6A change |
|--------|------|-----------------|
| `id` | uuid PK → `auth.users` | unchanged |
| `display_name`, `avatar_url` | text | unchanged |
| `created_at`, `updated_at` | timestamptz | unchanged |
| `current_fair_level` | text default `'Observer'` | **NEW** |
| `total_frames_analyzed` | int default 0 | **NEW** |
| `rolling_average_fair_score` | numeric default 0 | **NEW** |
| `highest_fair_score` | numeric default 0 | **NEW** |
| `best_classification` | text | **NEW** |
| `is_premium` | boolean default false | **NEW** |
| `is_founding_member` | boolean default false | **NEW** |
| `is_fair_circle_member` | boolean default false | **NEW** |

**RLS:** unchanged (SELECT/INSERT/UPDATE own row).

### `analysis_history` (changed)

| Column | Type | Build 6A change |
|--------|------|-----------------|
| `id` | uuid PK | unchanged |
| `user_id` | uuid FK → `auth.users` | unchanged |
| `analysis_mode` | text CHECK | unchanged |
| `scene_type` | text CHECK | unchanged |
| `story_context` | jsonb | unchanged |
| `result` | jsonb | unchanged |
| `source` | text | unchanged |
| `created_at` | timestamptz | unchanged |
| `fair_score` | numeric | **NEW** |
| `classification` | text | **NEW** |
| `image_type` | text | **NEW** |
| `category` | text | **NEW** |
| `chief_reaction` | text | **NEW** |
| `chief_assignment` | text | **NEW** |
| `detected_strengths` | jsonb default `[]` | **NEW** |
| `detected_weaknesses` | jsonb default `[]` | **NEW** |
| `attention_drivers` | jsonb default `[]` | **NEW** |
| `fair_level_at_capture` | text | **NEW** |

**Indexes:**

- `(user_id, created_at DESC)` — existing
- `(user_id, fair_score DESC)` — **NEW**

**RLS:** unchanged (SELECT/INSERT/DELETE own rows; no UPDATE policy).

### `visual_dna` (new table)

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid **PK** → `auth.users` CASCADE | |
| `dominant_archetype` | text default `'The Observer'` | |
| `trait_badges` | jsonb `[]` | |
| `subject_preferences` | jsonb `{}` | counter map |
| `composition_preferences` | jsonb `{}` | counter map |
| `light_preferences` | jsonb `{}` | counter map |
| `attention_drivers` | jsonb `{}` | counter map |
| `top_strengths` | jsonb `[]` | |
| `growth_areas` | jsonb `[]` | |
| `fair_score_trend` | text | nullable; not computed in 6A |
| `last_recalculated_at` | timestamptz | |
| `created_at`, `updated_at` | timestamptz | |

**RLS policies:**

- Users can read own visual dna (`SELECT`, `auth.uid() = user_id`)
- Users can insert own visual dna (`INSERT`)
- Users can update own visual dna (`UPDATE`)
- No DELETE policy

### `chief_daily_usage` (unchanged)

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid | composite PK with `usage_date` |
| `usage_date` | date | composite PK |
| `analysis_count` | int | |
| `last_request_at` | timestamptz | |

**RLS:** enabled, no client policies — service role only.

### `chief_request_dedup` (unchanged)

| Column | Type | Notes |
|--------|------|-------|
| `request_id` | text | PK |
| `user_id` | uuid | FK → `auth.users` |
| `created_at` | timestamptz | |

**Index:** `chief_request_dedup_created_idx` on `created_at`  
**RLS:** enabled, no client policies.

### Pre-6A delta summary

- **1 new table:** `visual_dna`
- **17 new columns** across `profiles` + `analysis_history`
- **1 new index** on `analysis_history`
- **3 new RLS policies** on `visual_dna`
- **No storage buckets, no public tables, no image persistence**

**Deployment note:** Migration exists in repo; live Supabase application via `npx supabase db push` was documented but not verified in this audit. If not pushed, screens will fail at runtime on missing columns/table.

---

## 4. Migration Review

| # | File | Purpose |
|---|------|---------|
| 1 | `20250601180000_init_fairframe.sql` | `profiles`, `analysis_history`, RLS, `handle_new_user` trigger |
| 2 | `20250603120000_report_phase.sql` | Re-affirm `analysis_mode` CHECK constraint |
| 3 | `20250604120000_chief_daily_usage.sql` | Usage limits, dedup, `reserve_chief_analysis()` |
| 4 | `20250610120000_build_6a_progression_foundation.sql` | Build 6A progression foundation |

### Build 6A migration detail

| Aspect | Detail |
|--------|--------|
| **Filename** | `20250610120000_build_6a_progression_foundation.sql` |
| **Purpose** | Additive progression schema |
| **Tables changed** | `analysis_history` (ALTER), `profiles` (ALTER), `visual_dna` (CREATE) |
| **Columns added** | 10 on `analysis_history`, 7 on `profiles` |
| **Indexes** | `analysis_history_user_score_idx`; `analysis_history_user_created_idx` (idempotent) |
| **Policies** | 3 on `visual_dna` (read/insert/update own) |
| **Destructive?** | **No** — all `ADD COLUMN IF NOT EXISTS` / `CREATE TABLE IF NOT EXISTS` |
| **Rollback risks** | Low for schema; dropping new columns/table would lose progression data if already populated. No down migration provided. |

---

## 5. FairLevel Implementation Audit

### Files and functions

| File | Functions / exports |
|------|---------------------|
| `src/types/fairLevel.ts` | `FairLevel`, `FairScoreClassification`, `FAIR_LEVEL_REQUIREMENTS`, `FAIR_LEVEL_ORDER`, `CLASSIFICATION_RANK` |
| `src/services/fairLevel.ts` | `getFairScoreClassification`, `rollingAverageFairScore`, `computeFairLevel`, `fairLevelIndex`, `nextFairLevel`, `progressToNextLevel`, `pickBestClassification` |
| `src/services/progression.ts` | `buildNormalizedAnalysisFields`, `fetchProfileProgression`, `updateProfileAfterAnalysis`, `runPostAnalysisProgression` |
| `app/progress.tsx` | Display FairLevel ladder and stats |
| `app/profile.tsx` | Display current FairLevel summary |

### Locked rules verification

| Level | Required | Implemented | Match? |
|-------|----------|-------------|--------|
| Observer | 0+ frames | `minFrames: 0` | Yes |
| Storyteller | 50+ frames | `minFrames: 50` | Yes |
| Visual Journalist | 200+ frames | `minFrames: 200` | Yes |
| Craftsman | 500+ frames + 6.5 rolling avg | `500` + `6.5` | Yes |
| Master | 1000+ frames + 7.5 rolling avg | `1000` + `7.5` | Yes |
| Chief Approved | 2500+ frames + 8.0 rolling avg | `2500` + `8.0` | Yes |
| Fair Circle | hidden / not implemented in 6A | DB flag + ladder row + `computeFairLevel` override | **Partial** |

### Rolling average logic

- `fetchRecentFairScores` queries last **100** rows with non-null `fair_score`, ordered `created_at DESC`
- `rollingAverageFairScore` uses `slice(0, 100)` and averages
- **Matches spec:** rolling average uses most recent 100 analyzed frames

### Frame count logic

- `fetchTotalFrames` counts **all** `analysis_history` rows for the user (including pre-6A rows without `fair_score`)

### Next-level progress logic

- `progressToNextLevel(level, totalFrames, rollingAverage)` returns `framesNeeded` and `avgNeeded` for the next tier
- Displayed on Progress screen as text (e.g. "47 more frames · raise rolling avg by 1.2")

### Where FairLevel is recalculated

- After signed-in analysis save: `saveAnalysisHistory` → `runPostAnalysisProgression` → `updateProfileAfterAnalysis` → `computeFairLevel` → `profiles` update
- Non-blocking (`void` — does not block navigation to results)

### Where FairLevel is displayed

- `app/progress.tsx` — primary display with full ladder
- `app/profile.tsx` — summary line
- `analysis_history.fair_level_at_capture` — snapshot at save time (not shown in UI)

### Progress screen checklist

| Metric | Shown? |
|--------|--------|
| Current FairLevel | Yes |
| Highest FairScore ever | Partial — labeled "Best score" but computed as **max of last 100 scores**, not all-time |
| Average FairScore | Yes — as "Rolling avg" |
| Total frames analyzed | Yes |
| Next level | Partial — gap text only, not named (e.g. "Storyteller") |
| Frame progress | Partial — numeric only, no progress bar |
| Rolling average progress | Partial — numeric only, no progress bar |

---

## 6. Visual DNA Implementation Audit

### Files

- `src/types/visualDNA.ts` — `VisualDNA` interface
- `src/services/visualDNA.ts` — merge, fetch, upsert, recalculate
- `app/dna.tsx` — primary display
- `app/profile.tsx` — archetype text only

### Database table structure

See Section 3 (`visual_dna` table). JSONB fields store counter maps (`subject_preferences`, etc.) and string arrays (`trait_badges`, `top_strengths`, `growth_areas`).

### Update logic

```
recalculateVisualDNA(userId, result)
  → fetchVisualDNA(userId)
  → mergeVisualDNAFromAnalysis(existing, result)
  → upsertVisualDNA(userId, merged)
```

Triggered from `runPostAnalysisProgression` after each signed-in save.

### Archetype logic (8 starter archetypes)

The Observer, The Story Hunter, The Light Chaser, The Humanist, The Explorer, The Minimalist, The Moment Collector, The Atmosphere Builder.

- Base mapping from `imageType` via `IMAGE_TYPE_ARCHETYPE`
- Keyword overrides from top subject preferences (light/sun → Light Chaser; people/face → Humanist; sky/weather → Atmosphere Builder)
- Invalid archetype falls back to "The Observer"

### Trait badge logic

- Frequency merge of existing badges + top 2 `whyItWorks` from current analysis
- Cap: 6 badges
- Sorted by occurrence count

### Subject preference logic

- Increment counter for `imageType` (+2 weight)
- Increment counter for each `whatISaw` item (up to 5)

### Composition preference logic

- Increment counter for each `visualHierarchy` element
- **Stored but not displayed** on DNA screen

### Light preference logic

- Increment counter for `whatISaw` items containing "light", "shadow", or "sun"
- **Stored but not displayed** on DNA screen

### Attention driver logic

- Increment counter for `attentionGrabber` (+2 weight)
- Increment counter for each `visualHierarchy` element

### Gradual identity confirmation

**Yes** — merge logic accumulates counters and frequency-ranked lists. A single image cannot overwrite the user's full identity; it increments existing preferences and re-ranks strengths/growth areas.

### Where Visual DNA is displayed

| Element | DNA screen | Profile screen |
|---------|------------|----------------|
| Dominant archetype | Yes | Yes (text) |
| Trait badges | Yes | No |
| Top strengths | Yes | No |
| Growth areas | Yes | No |
| Subject lean | Yes | No |
| Attention drivers | Yes | No |
| Composition preferences | No | No |
| Light preferences | No | No |
| Premium locked sections | No | No |

### Not implemented in 6A

- `fair_score_trend` — column exists, never computed (copied from existing on merge)

---

## 7. Progress Screen Audit

| Item | Value |
|------|-------|
| **Route** | `/progress` |
| **Filename** | `app/progress.tsx` |
| **Data source** | `fetchProfileProgression(auth.user.id)` → `profiles` table |
| **Components** | `Screen`, `Card`, `Label`, `Button` |
| **Auth gate** | Signed-in non-anonymous only; others see sign-in CTA |

**Displayed metrics:**

- Current FairLevel (hero)
- Total frames analyzed
- Rolling average FairScore
- Best score (highest in recent window)
- Best classification (if set)
- Next-level frame/avg requirements (text)
- Full FairLevel ladder with reached/unreached styling

**Navigation out:** Visual DNA, Profile, Back

---

## 8. DNA Screen Audit

| Item | Value |
|------|-------|
| **Route** | `/dna` |
| **Filename** | `app/dna.tsx` |
| **Data source** | `fetchVisualDNA(auth.user.id)` → `visual_dna` table |
| **Components** | `Screen`, `Card`, `Label`, `ListSection`, `Button` |
| **Free-user view** | Sign-in prompt (same pattern as Progress) |
| **Premium placeholder sections** | **None implemented** |

**Empty state:** Shown when no DNA row exists, or default Observer with no strengths — prompts user to analyze frames while signed in.

---

## 9. Profile Screen Audit

| Item | Value |
|------|-------|
| **Route** | `/profile` |
| **Filename** | `app/profile.tsx` |
| **Data source** | `profiles` + `visual_dna` + `auth.user` |
| **Components** | `Screen`, `Card`, `Label`, `Button` |

**Fields displayed:**

| Field | Shown? |
|-------|--------|
| Account identity (email) | Yes |
| `display_name` | No — not fetched |
| FairLevel | Yes |
| Frame count + rolling avg | Yes |
| Visual DNA archetype | Yes (text) |
| Trait badges | No |
| Avatar | No |
| Premium / founding / circle status | No — DB columns exist, UI not wired |

**Actions:** Navigate to Progress, DNA, Capture; Sign out; Back

---

## 10. Navigation Audit

### Current navigation structure

- **Router:** Expo Router 6, Stack layout (`app/_layout.tsx`), `headerShown: false`
- **No tab bar** — deferred to Build 6B per implementation plan

### All routes

| Route | Screen | Status |
|-------|--------|--------|
| `/` | Welcome | Works |
| `/login` | Sign in | Works |
| `/camera-permission` | Camera permission | Works |
| `/capture` | Camera capture | Works |
| `/upload` | Photo picker | Works |
| `/analysis-loading` | Chief analysis | Works |
| `/results` | Sprint 4 results | Works |
| `/progress` | FairLevel progress | **NEW** |
| `/dna` | Visual DNA | **NEW** |
| `/profile` | User profile | **NEW** |
| `/auth/callback` | OAuth callback | Works |

### Happy path (unchanged)

```
Welcome → login or skip → camera-permission → capture or upload → analysis-loading → results
```

### Progression navigation (signed-in only)

- **Home** → My Progress, Visual DNA, Profile
- **Results** → My Progress, Visual DNA, Profile
- **Progress** ↔ DNA ↔ Profile (cross-links)
- **Profile** → Capture a frame

### Gaps

- No dedicated "Analyze" entry from Progress/DNA (must use Profile → Capture or return to Home)
- Guest/skip users do not see progression nav on Home

### Routing regressions

None identified. No route guards were added that would block the capture flow.

---

## 11. Chief / Analysis Pipeline Regression Check

### Files inspected

- `src/services/chief.ts`
- `src/services/parseChiefResponse.ts`
- `src/services/analysisHistory.ts`
- `supabase/functions/analyze-frame/index.ts`
- `supabase/functions/analyze-frame/chiefGuard.ts`

### Verification

| Check | Status |
|-------|--------|
| OpenAI runs server-side only | Yes — edge function uses `OPENAI_API_KEY` from Deno env |
| API key protected | Yes — not in client repo or `.env` for OpenAI |
| Mock Chief fallback | Yes — on missing config, founder gate, or invoke error |
| Sprint 4 parse surface | Yes — `chiefsReaction`, `whatISaw`, `fairScore`, `whyItWorks`, `chiefsAssignment` |
| Build 6A normalized fields saved | Yes — 10 columns + full `result` JSONB on insert |
| Existing results UI | Yes — unchanged Sprint 4 layout |
| Edge function modified in 6A | No — founder guards intact |

### Pipeline order (preserved)

```
analysis-loading
  → analyzeWithChief(session)
  → setResult / setAnalysisSource
  → saveAnalysisHistory(session, result, source)  // includes normalized columns
  → router.replace("/results")
  → runPostAnalysisProgression (async, non-blocking)
```

### Parser additions (Build 6A)

`parseChiefResponse.ts` now derives at parse time:

- `classification`
- `detectedStrengths`
- `detectedWeaknesses`
- `attentionDrivers`
- `visualDnaHints`

These populate `ChiefAnalysisResult` optional fields; UI still uses Sprint 4 field names.

---

## 12. TypeScript / Type Safety Audit

### `src/types/database.ts`

- Expanded with `profiles` progression columns, `analysis_history` normalized columns, `visual_dna` table
- Added `Json` type alias
- Added `Relationships`, `Views`, `Functions`, `Enums`, `CompositeTypes` stubs for Supabase client compatibility

**Still missing:** `chief_daily_usage`, `chief_request_dedup` (pre-existing gap from v2 audit)

### `src/types/analysis.ts`

- Added `VisualDnaHints` interface
- Added optional Build 6A fields on `ChiefAnalysisResult`
- Legacy fields retained (`visualStorytellingScore`, `sceneType`, pillars, etc.)

### `src/types/fairLevel.ts`

- `FairLevel` union type
- `FairScoreClassification` union type
- `FAIR_LEVEL_REQUIREMENTS` constant array with locked thresholds

### `src/types/visualDNA.ts`

- `VisualDNA` interface matching DB shape (with TS-friendly Record types for JSONB maps)

### Type mismatches and loose typing

| Issue | Severity |
|-------|----------|
| `fetchVisualDNA` casts row `as VisualDNA` without runtime validation | Low |
| `result as unknown as Json` on history insert | Low |
| `appRoutes.ts` uses `as Href` for new routes (stale Expo generated types) | Low |
| Edge function Deno files fail app `tsc` | Expected — pre-existing |
| No widespread `any` in app layer | Good |

App-layer TypeScript (excluding `supabase/functions`) passes `tsc --noEmit`.

---

## 13. Legacy Cleanup Audit

| Item | Status | Notes |
|------|--------|-------|
| `ChiefObservation.tsx` | **Deleted** | Was orphaned after Sprint 4 |
| `ScoreRing.tsx` | **Deleted** | Replaced by `FairScoreCard` |
| `story_context` column | **Deprecated** | Still in DB; app always inserts `null` |
| `enhanced` / `visual` / `story-aware` modes | **Deprecated** | Still in DB CHECK constraint; app only inserts `'initial'` |
| `visualStorytellingScore` | **Still used** | Parser and mock derive from FairScore for legacy compat |
| Pillar scores | **Still used** | `ExpandableFullAnalysis`, `PillarScores`, `WhatChiefSees` |
| `app/story-context.tsx` | **Deleted** | Removed in Sprint 4 (before 6A) |
| Client `chiefPrompt.ts` | **Still present** | Duplicate of edge prompt; edge is source of truth |

**Recommendation for later cleanup:** Remove unused analysis_mode CHECK values, backfill or ignore `story_context`, consolidate client/edge prompts.

---

## 14. Security and Cost Control Audit

| Control | Status |
|---------|--------|
| OpenAI key not client-side | Confirmed |
| Daily usage limits (20/day) | Confirmed — `reserve_chief_analysis` + edge guard |
| Founder/beta protections | Confirmed — `liveChiefAccess.ts` + `chiefGuard.ts` + `FOUNDER_EMAILS` |
| No public image storage added | Confirmed |
| No social feed or public gallery | Confirmed |
| RLS protects user data | Confirmed — profiles, analysis_history, visual_dna owner-scoped |
| chief_daily_usage / chief_request_dedup | Service-role only, no client policies |
| No expensive background jobs | Confirmed — progression is inline post-save |
| `verify_jwt: true` on edge function | Unchanged |

---

## 15. Build 6A Deviation Report

### A. Fully completed items

- Migration #4 (additive schema)
- `fairLevel.ts`, `visualDNA.ts`, `progression.ts` services
- Normalized `analysis_history` persistence on save
- Profile aggregate updates after analysis
- Visual DNA merge and upsert after analysis
- Progress, DNA, Profile screens
- Navigation links from Home and Results (signed-in)
- Orphan component deletion (`ChiefObservation`, `ScoreRing`)
- Live Chief, auth, and capture flow preserved
- FairLevel threshold constants match locked spec
- Rolling average window = 100 frames

### B. Partially completed items

- **Fair Circle** — DB flag and compute logic exist; shown in ladder UI (audit checklist said hidden)
- **Progress screen** — core metrics present; no progress bars or named next level
- **DNA screen** — free view complete; no premium locked placeholder sections
- **Profile screen** — email + level + archetype; no display name, badges, or membership UI
- **Navigation** — cross-links work; no tab bar (explicitly deferred)
- **`database.ts`** — expanded but still omits chief usage tables
- **Migration deployment** — file in repo; live `db push` unconfirmed

### C. Missing items

- Tab navigation (deferred to 6B)
- Premium placeholder sections on DNA screen
- `fair_score_trend` computation
- Analysis history list UI (out of 6A scope)
- Automated unit tests for FairLevel / DNA merge
- Server-side normalized fields in edge function (client-side derivation only)
- `display_name` on Profile screen
- Progress bars for frame/avg advancement

### D. Items implemented differently than specified

- **`chiefsReaction` vs `chief_reaction`** — UI keeps camelCase; DB uses snake_case mapping
- **Navigation** — button links from Home/Results instead of tab bar
- **`highest_fair_score`** — stored as max of recent 100 scores, not true lifetime max
- **Fair Circle** — appears in ladder as "Manual invite" rather than fully hidden

### E. Unexpected architectural decisions

- `progression.ts` orchestration layer separate from `analysisHistory.ts`
- `appRoutes.ts` with `as Href` casts instead of regenerating Expo typed routes
- Post-save progression fire-and-forget (`void`) — good for UX, silent on failure
- DNA empty-state treats default Observer + no strengths as "no data yet"
- Classification bands defined in code (not in directive) — 9 tiers from Developing to Historic

---

## 16. Bug / Risk Report

| Severity | Issue | Detail |
|----------|-------|--------|
| **High** | Migration may not be applied to live Supabase | Progression screens and saves will error on missing columns/table |
| **Medium** | `highest_fair_score` not all-time max | `updateProfileAfterAnalysis` uses `Math.max(...scores)` on last 100 rows only |
| **Medium** | Pre-6A history rows lack `fair_score` | Rolling average ignores legacy rows until backfilled |
| **Low** | Silent progression failures | Only `console.warn`; user may see stale Progress/DNA |
| **Low** | Race on fast navigation | User opens Progress before post-save completes |
| **Low** | Duplicate classification logic | Computed in both `parseChiefResponse.ts` and `fairLevel.ts` |
| **Low** | `visual_dna` JSONB shape not validated at runtime | Type cast may hide malformed data |
| **Low** | Fair Circle in ladder | May confuse users — no workflow to earn it |

**Not found:**

- Broken imports from deleted components
- Edge function regressions from 6A changes
- New expensive API calls or background workers

**Scalability note:** Per-save profile recount + DNA merge is acceptable at beta volume. At scale, consider DB triggers, materialized aggregates, or batch recompute jobs.

---

## 17. Build 6B Readiness Report

Build 6B scope (anticipated): PRESS CARD, card preview, card rendering engine, FairScore Lens, FairFrame Mark, milestone cards, signature cards, card verification IDs, card export/share flow.

| 6B item | What already exists | Likely files to modify | Likely new files | Difficulty |
|---------|---------------------|------------------------|------------------|------------|
| **PRESS CARD** | Profile progression, `FairScoreCard`, normalized history | Results, profile, navigation | `app/card.tsx`, card templates | Medium |
| **Card preview screen** | Session image URI (local only, not persisted) | Session context, results | `CardPreview.tsx` | Medium — image strategy needed |
| **Card rendering engine** | Theme tokens, typography, brand assets | Theme, components | `src/services/cardRender.ts` | Medium–High |
| **FairScore Lens** | `FairScoreCard`, `formatFairScore` | Extract from results | `FairScoreLens.tsx` | Low |
| **FairFrame Mark** | Brand in welcome screen, app icons | Assets | `FairFrameMark.tsx` | Low |
| **Milestone cards** | `FAIR_LEVEL_REQUIREMENTS`, `best_classification`, `fair_level_at_capture` | `progression.ts`, profile | `milestoneCards.ts` | Medium |
| **Signature cards** | `visual_dna.dominant_archetype`, trait badges | DNA service, card templates | — | Medium |
| **Card verification IDs** | None | — | New migration + verification service | Medium |
| **Export/share flow** | None | — | `expo-sharing`, `react-native-view-shot` integration | Medium |

### Major risks before 6B

1. **Images not stored in Supabase** — cards must use session-local URI or require a storage decision
2. **`highest_fair_score` bug** — milestone cards may use wrong "best ever" value
3. **Tab navigation** — card discovery may need better nav than button links
4. **Migration not live** — must apply Build 6A schema before card data dependencies work

### Implementation difficulty overall

**Medium** — strong foundation exists (scores, levels, DNA, theme), but card rendering, image handling, and share flow are net-new work.

---

## 18. Final Post-6A CTO Summary

### Is Build 6A complete?

**Substantively yes** in the codebase. Schema migration, services, screens, persistence hooks, and navigation are implemented. **Operationally conditional** on applying migration #4 to live Supabase and smoke-testing signed-in progression end-to-end.

### Is the app stable?

**Yes for the core loop.** Capture → analysis → results is unchanged. Progression is additive and non-blocking. Main stability risk is **schema drift** if the migration was not pushed to the live project.

### Is the architecture better than before?

**Yes.** Normalized columns enable querying without parsing JSONB. Profile aggregates and Visual DNA create a clear foundation for cards, milestones, and membership features without rewriting the Chief pipeline.

### What must be fixed before Build 6B?

1. Confirm `npx supabase db push` on live project
2. Fix `highest_fair_score` to true all-time max (or rename UI to "Recent best")
3. Smoke-test: signed-in save → Progress and DNA update correctly
4. Decide image strategy for cards (session-only vs Supabase storage)
5. Optionally hide Fair Circle from ladder until workflow exists
6. Consider premium placeholder sections on DNA if 6B includes paywall UX

### What is safe to build next?

**Build 6B card layer** — reuse `FairScoreCard`, theme system, `fairLevel` types, `visual_dna` archetype data, and profile progression fields. Tab bar and history UI can run in parallel or follow cards. Do **not** start subscriptions, public profiles, or image storage without an explicit product decision.

---

## Appendix: Key File Reference

| Area | Paths |
|------|-------|
| Migration | `supabase/migrations/20250610120000_build_6a_progression_foundation.sql` |
| FairLevel | `src/services/fairLevel.ts`, `src/types/fairLevel.ts` |
| Visual DNA | `src/services/visualDNA.ts`, `src/types/visualDNA.ts` |
| Progression orchestration | `src/services/progression.ts`, `src/services/analysisHistory.ts` |
| Parser | `src/services/parseChiefResponse.ts` |
| Screens | `app/progress.tsx`, `app/dna.tsx`, `app/profile.tsx` |
| Navigation | `app/index.tsx`, `app/results.tsx`, `src/lib/appRoutes.ts` |
| Chief pipeline | `src/services/chief.ts`, `supabase/functions/analyze-frame/` |
| Founder gates | `src/lib/liveChiefAccess.ts`, `supabase/functions/analyze-frame/chiefGuard.ts` |
| Types | `src/types/database.ts`, `src/types/analysis.ts` |

---

*End of FairFrame Build 6A Post-Implementation Audit*
