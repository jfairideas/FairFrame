# FairFrame Codebase Audit Report (v2)

> **Note (June 2026):** This audit predates Builds 6B and 6C. For current product state see [README.md](../README.md), [ROADMAP.md](ROADMAP.md), and [CHANGELOG_BUILD6.md](../CHANGELOG_BUILD6.md).

**Directive:** Read-only inspection before architecture upgrade. No code or files were modified during this audit.

**Repo:** `~/fairframe`  
**GitHub:** https://github.com/jfairideas/FairFrame  
**Supabase project:** `eaficgjjvtekrqcxlaoy` (live, 4 public tables)  
**Stack:** Expo SDK 54, React Native 0.81, React 19, Expo Router 6, Supabase, OpenAI via edge function  
**Audit date:** June 2026

---

## 1. Full Project Tree

```
fairframe/
├── app/                          # Expo Router screens (file-based routes)
│   ├── _layout.tsx
│   ├── index.tsx                 # Welcome
│   ├── login.tsx
│   ├── camera-permission.tsx
│   ├── capture.tsx
│   ├── upload.tsx
│   ├── analysis-loading.tsx
│   ├── results.tsx
│   └── auth/
│       └── callback.tsx
├── src/
│   ├── components/               # 12 UI components (no top-level components/)
│   ├── context/                  # AuthContext, SessionContext
│   ├── lib/                      # supabase, authSession, liveChiefAccess
│   ├── services/                 # chief, mockChief, parseChiefResponse, chiefPrompt, analysisHistory
│   ├── theme/                    # colors, spacing, typography
│   ├── types/                    # analysis.ts, database.ts
│   └── utils/                    # fairScore, imageType, labels, pillars
├── supabase/
│   ├── config.toml
│   ├── migrations/               # 3 SQL migrations
│   └── functions/
│       └── analyze-frame/        # index.ts, chiefPrompt.ts, chiefGuard.ts
├── assets/                       # icon, splash, favicon, adaptive-icon
├── scripts/                      # generate-icons.mjs, set-openai-secret.sh, set-founder-secrets.sh
├── docs/                         # Founder Bible, sprint notes, integration docs
├── package.json
├── package-lock.json
├── app.json
├── tsconfig.json
├── babel.config.js
├── .nvmrc
├── .npmrc
├── .env.example
├── .gitignore
├── README.md
├── START.md
└── expo-env.d.ts
```

**Not present (directive asked for):**

- `components/` at repo root → lives at `src/components/`
- `hooks/` → **does not exist**
- Dedicated `utils/` at root → `src/utils/`

**Config files:** `app.json`, `tsconfig.json`, `babel.config.js`, `supabase/config.toml`, `.env.example`, `.nvmrc` (Node 22), `.npmrc` (`legacy-peer-deps=true`)

---

## 2. App Architecture Report

### Navigation & routing

- **Router:** Expo Router 6, file-based, `Stack` in `app/_layout.tsx`, `headerShown: false`
- **Entry:** `package.json` → `"main": "expo-router/entry"`
- **Deep link scheme:** `fairframe://` (OAuth callback)

### Screen hierarchy (typical happy path)

```
/ (Welcome)
  → /login (optional)
  → /camera-permission
  → /capture OR /upload
  → /analysis-loading
  → /results
```

**Bypass paths:** Skip to camera from welcome/login without auth; guest anonymous auth available.

### State management

| Layer | Location | Responsibility |
|--------|----------|----------------|
| **Auth** | `AuthContext` | Supabase session, user, sign-in/out methods |
| **Capture session** | `SessionContext` | `imageUri`, analysis `result`, `analysisSource`, fallback reason |
| **No global store** | — | No Redux, Zustand, or React Query |

### Authentication flow

1. `AuthProvider` loads session from Supabase + `AsyncStorage`
2. Login: email/password, magic link, Google, Apple, anonymous guest
3. OAuth → `WebBrowser.openAuthSessionAsync` → `app/auth/callback.tsx` → `createSessionFromUrl`
4. **No route guards** — screens do not require auth; Live Chief gated in `chief.ts` + edge function

---

## 3. Screen Inventory

| File | Route | Purpose | Components used |
|------|-------|---------|-----------------|
| `app/index.tsx` | `/` | Welcome / mission | `Screen`, `Button` |
| `app/login.tsx` | `/login` | Sign-in, guest, skip | `Screen`, `Button`, `Card` |
| `app/camera-permission.tsx` | `/camera-permission` | Camera rationale + CTA | `Screen`, `Button`, `Card` |
| `app/capture.tsx` | `/capture` | Live camera capture | `Button`, `CameraView` |
| `app/upload.tsx` | `/upload` | Pick photo from library | `Screen`, `Button`, `Card` |
| `app/analysis-loading.tsx` | `/analysis-loading` | Invoke Chief, loading UX | `Screen` |
| `app/results.tsx` | `/results` | Sprint 4 result flow | `Screen`, `Card`, `FairScoreCard`, `ExpandableFullAnalysis`, `ListSection`, `ChiefSourceBanner`, `Button`, `Label` |
| `app/auth/callback.tsx` | `/auth/callback` | OAuth deep link handler | (minimal UI) |

**Deleted (Sprint 4):** `app/story-context.tsx` — no longer in repo.

---

## 4. Component Inventory

| File | Purpose | Props | Used in |
|------|---------|-------|---------|
| `Button.tsx` | Primary UI actions | `label`, `onPress`, `variant`, `disabled`, `style` | Most screens |
| `Card.tsx` | Content container | `children`, `style` | login, upload, camera-permission, results |
| `Screen.tsx` | Safe-area scroll wrapper | `children`, `scroll` | Most screens |
| `Label.tsx` | Section headings | `children` | results, ExpandableFullAnalysis |
| `ListSection.tsx` | Bulleted lists | `title`, `items`, `tone` | results, ExpandableFullAnalysis |
| `FairScoreCard.tsx` | FairScore X.X / 10 display | `fairScore` | results |
| `ExpandableFullAnalysis.tsx` | Collapsible deep analysis | `result` | results |
| `ChiefSourceBanner.tsx` | LIVE vs OFFLINE badge | `source`, `fallbackReason` | results |
| `PillarScores.tsx` | Six pillar bars | `pillars` | ExpandableFullAnalysis only |
| `WhatChiefSees.tsx` | Per-pillar observations | `items` | ExpandableFullAnalysis only |
| `ChiefObservation.tsx` | Sprint 3 observation block | `result` | **Unused** (orphaned) |
| `ScoreRing.tsx` | Circular score (old VSS) | `score`, `label`, `size` | **Unused** (orphaned) |

---

## 5. Supabase Audit

### Live tables (`public`)

#### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | **PK**, FK → `auth.users(id)` ON DELETE CASCADE |
| `display_name` | text | |
| `avatar_url` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**RLS:** SELECT/INSERT/UPDATE own row (`auth.uid() = id`)  
**Trigger:** `handle_new_user()` on `auth.users` insert (SECURITY DEFINER)

#### `analysis_history`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | **PK**, default `gen_random_uuid()` |
| `user_id` | uuid | FK → `auth.users(id)` CASCADE |
| `analysis_mode` | text | CHECK: `initial`, `enhanced`, `visual`, `story-aware` |
| `scene_type` | text | CHECK: `subject-present`, `location-scout` |
| `story_context` | jsonb | Nullable; **always null** in app now |
| `result` | jsonb | Full `ChiefAnalysisResult` blob |
| `source` | text | `live-chief` / `offline-preview` |
| `created_at` | timestamptz | |

**Index:** `(user_id, created_at DESC)`  
**RLS:** SELECT/INSERT/DELETE own rows; **no UPDATE policy**

#### `chief_daily_usage`

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid | **PK** (composite with `usage_date`) |
| `usage_date` | date | **PK** |
| `analysis_count` | int | |
| `last_request_at` | timestamptz | |

**RLS:** Enabled, **no client policies** — edge function uses service role only

#### `chief_request_dedup`

| Column | Type | Notes |
|--------|------|-------|
| `request_id` | text | **PK** |
| `user_id` | uuid | FK → `auth.users` |
| `created_at` | timestamptz | |

**Index:** `created_at`  
**RLS:** Enabled, no client policies

### Functions

- `reserve_chief_analysis(p_user_id, p_max_daily, p_min_interval_seconds)` — SECURITY DEFINER; EXECUTE revoked from `anon`/`authenticated`

### Gaps

- `src/types/database.ts` only types `profiles` + `analysis_history` — **missing** `chief_daily_usage`, `chief_request_dedup`
- No Storage buckets configured
- No FairScore aggregate tables, achievements, subscriptions, or public profiles

---

## 6. Edge Function Audit

### `analyze-frame` (v9, ACTIVE, `verify_jwt: true`)

| Aspect | Detail |
|--------|--------|
| **Files** | `index.ts`, `chiefPrompt.ts`, `chiefGuard.ts` |
| **Purpose** | Founder-only OpenAI vision proxy for Live Chief |
| **Input** | JSON: `{ imageBase64, requestId?, session?: {} }` + `Authorization: Bearer <JWT>` |
| **Guards** | `FOUNDER_EMAILS`, auth, non-anonymous, dedup, 20/day cap, 15s interval, 8MB base64 max |
| **API called** | `https://api.openai.com/v1/chat/completions` |
| **Output** | Sprint 4 JSON (FairScore, reaction, assignment, pillars, etc.) or error object |
| **Secrets** | `OPENAI_API_KEY`, `FOUNDER_EMAILS`; auto: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

**No other edge functions** deployed.

---

## 7. OpenAI Audit

| Topic | Detail |
|-------|--------|
| **Call locations** | **Only** `supabase/functions/analyze-frame/index.ts` (server). App never holds API key. |
| **Client path** | `chief.ts` → `supabase.functions.invoke("analyze-frame")` |
| **Fallback** | `mockChief.ts` when offline, non-founder, or invoke fails |
| **Model** | `gpt-4o` |
| **Vision** | `image_url` with `detail: "high"` |
| **Params** | `temperature: 0.4`, `max_tokens: 2800`, `response_format: { type: "json_object" }` |
| **Prompts** | `src/services/chiefPrompt.ts` (client reference) + `supabase/functions/analyze-frame/chiefPrompt.ts` (deployed) — **must be kept in sync manually** |
| **Parsing** | `parseChiefResponse.ts` — normalizes aliases, builds `ChiefAnalysisResult`, FairScore 0–10 |
| **Token controls** | `max_tokens: 2800` only; no client-side truncation; image size cap on base64 length |

---

## 8. Authentication Audit

| Feature | Status |
|---------|--------|
| **Login** | Email/password in `login.tsx` |
| **Signup** | Toggle on same screen |
| **Magic link** | `signInWithOtp` |
| **OAuth** | Google + Apple (providers **disabled** in `supabase/config.toml`; need dashboard config) |
| **Guest** | `signInAnonymously()` |
| **Session** | Supabase + AsyncStorage, PKCE, `autoRefreshToken` |
| **Protected routes** | **None** at router level |
| **Live Chief protection** | Client (`liveChiefAccess.ts`) + server (`chiefGuard.ts`) founder email allowlist |

---

## 9. Subscription Audit

| Area | Status |
|------|--------|
| Premium implementation | **None** |
| Payments (Stripe, IAP, etc.) | **None** |
| Entitlements / tiers | **None** |
| Paywall UI | **None** |

README lists subscriptions as **planned** only.

---

## 10. Image Pipeline Audit

| Stage | Implementation |
|-------|----------------|
| **Capture** | `expo-camera` → local `file://` URI, quality 0.85 |
| **Upload** | `expo-image-picker` → local URI |
| **Storage** | **Device only** — no Supabase Storage bucket |
| **Transfer** | `expo-file-system` reads base64 in `chief.ts` |
| **Analysis** | POST base64 to edge function → OpenAI |
| **Persistence** | JSON `result` in `analysis_history` (signed-in non-guest only); **image not stored** |
| **Deletion** | No explicit cleanup; URIs ephemeral on device |

---

## 11. Database Migration History

| Migration | Filename | Purpose |
|-----------|----------|---------|
| Initial schema | `20250601180000_init_fairframe.sql` | `profiles`, `analysis_history`, RLS, `handle_new_user` trigger |
| Report phases | `20250603120000_report_phase.sql` | Widen `analysis_mode` CHECK constraint |
| Usage limits | `20250604120000_chief_daily_usage.sql` | Usage limits, dedup, `reserve_chief_analysis()` |

All three applied on remote project `eaficgjjvtekrqcxlaoy`.

---

## 12. Risk Report

### Technical debt

- **Duplicate prompt files** (app vs edge) — drift risk
- **Legacy schema fields** (`analysis_mode` enhanced/visual, `story_context`, `scene_type`) vs Sprint 4 single-shot flow
- **Legacy result fields** in `ChiefAnalysisResult` (`visualStorytellingScore`, `sceneType`, `firstImpression` mirrors)
- **`database.ts` out of sync** with migrations
- **Orphan components** (`ChiefObservation`, `ScoreRing`)
- **Sprint docs** (2/3) describe removed flows — documentation lag

### Duplicate systems

- Live Chief vs offline mock (intentional fallback, but same UI path)
- Client founder gate + server founder gate (good defense in depth, but two places to update)
- Pillar scoring + FairScore (both maintained in parser)

### Unused / dead code

- `ChiefObservation.tsx`, `ScoreRing.tsx`
- `sceneTypeLabel` / `labels.ts` — minimal use post–Sprint 4
- `story-context` route removed; DB still accepts `enhanced` mode

### Security concerns

- **Founder-only** is email allowlist — not role-based RBAC
- **No route-level auth** — public app flow; cost protected server-side for Live Chief only
- **`handle_new_user`** flagged by Supabase linter as callable via RPC (low practical risk)
- **CORS `*`** on edge function
- **Anon key** in client bundle (expected); OpenAI key server-only (good)
- **`.env` gitignored**; project ref public in docs

### Scalability concerns

- Base64 images in function payload (size/latency)
- `gpt-4o` + `detail: high` + 2800 tokens — costly per call
- No queue/async jobs for analysis
- `analysis_history.result` as large JSONB — no normalized FairScore time series
- 20/day founder cap — not productized per-user tiers
- No CDN/storage for thumbnails

---

## 13. FairFrame v3.0 Implementation Readiness

*Assuming v3.0 = README vision: FairScore progress, achievements, public profiles, Top 100, subscriptions, analytics, broader Live Chief.*

### A. What already exists (supports v3.0)

| Capability | Evidence |
|------------|----------|
| Mobile shell + dark brand | Expo app, theme system, assets |
| Core capture flow | Camera + upload + results |
| Chief analysis pipeline | Edge function + parser + mock fallback |
| Sprint 4 UX model | Reaction → What I Saw → FairScore → Assignment → Expand |
| Auth foundation | Supabase Auth, profiles table, OAuth scaffold |
| Analysis persistence | `analysis_history` with JSON results |
| Founder beta protections | Daily limits, dedup, JWT, allowlist |
| FairScore in types/parser/UI | `fairScore.ts`, `FairScoreCard`, prompts |
| Ethics in prompts | Bias guardrails in system prompt |
| GitHub + Supabase prod project | Deployed `analyze-frame` v9 |

### B. What must be modified

| Item | Why |
|------|-----|
| `analysis_history` schema | FairScore field, `image_type`, drop/ignore legacy story fields |
| `database.ts` | Full schema types |
| Auth / routing | Optional protected routes, roles beyond founder email |
| `chiefGuard.ts` | Product tiers vs founder-only allowlist |
| Results/history UI | **No history list screen** today — need profile/progress views |
| Prompt + parser | v3 scoring rules, progress-aware coaching |
| `analysisHistory.ts` | Store FairScore explicitly, link to storage URLs |
| README/docs vs code | Align sprint 2/3 docs with Sprint 4 |
| OAuth config | Enable Google/Apple in dashboard + config |

### C. What must be created

| Item | Priority for v3 |
|------|-----------------|
| FairScore time-series / aggregates | High |
| Progress tracking UI | High |
| Analysis history browser | High |
| Image storage bucket + thumbnails | Medium |
| Achievements system + tables | Medium |
| Public creator profiles | Medium |
| FairFrame Top 100 | Medium |
| Subscription + entitlements (Stripe/IAP) | Medium |
| Role-based access (founder → beta → public) | High |
| Hooks layer (optional) | Low |
| Background job queue (optional) | Medium |
| Admin/analytics dashboard | Medium |

### D. What should be deleted

| Item | Rationale |
|------|-----------|
| `ChiefObservation.tsx` | Unused after Sprint 4 |
| `ScoreRing.tsx` | Replaced by `FairScoreCard` |
| Legacy story-mode DB constraints/values | Or migrate to deprecated |
| Duplicate sprint prompt docs (optional archive) | Reduce confusion |
| `visualStorytellingScore` surface in UI (already hidden) | Fully deprecate in types/API when stable |

### E. Estimated implementation difficulty

| Workstream | Difficulty | Notes |
|------------|------------|-------|
| FairScore DB + history UI | **Medium** | Schema + 1–2 screens |
| Progress / analytics | **Medium–High** | Aggregations, charts |
| Storage pipeline | **Medium** | Bucket, RLS, upload after capture |
| Subscriptions | **High** | IAP/Stripe, entitlements, paywall |
| Public profiles + Top 100 | **High** | New tables, moderation, privacy |
| Achievements | **Medium** | Rules engine + UI |
| Replace founder allowlist with tiers | **Medium** | Edge + client + Supabase roles |
| OpenAI cost optimization | **Low–Medium** | Model routing, `detail: low`, caching |
| v3 prompt/coaching iteration | **Medium** | Prompt engineering + evals |

**Overall v3.0 from current codebase:** **Medium–High** (8–14+ weeks for full README roadmap depending on subscription and social features).

---

## Summary

FairFrame is a **focused MVP**: Expo Router app, single analysis edge function, Supabase auth + history, Sprint 4 FairScore UI, founder-gated Live Chief. It is **not** yet a platform — no subscriptions, no storage, no history UI, no FairScore analytics, no public profiles.

The strongest foundation for v3.0 is the **analysis pipeline** (capture → Chief → parse → results) and **Supabase backbone**. The largest gaps for a major architecture upgrade are **data model normalization (FairScore over time)**, **media storage**, **entitlements**, and **user-facing history/progress surfaces**.

---

*Generated per FairFrame Cursor Audit Directive v2 — audit only, no code changes.*
