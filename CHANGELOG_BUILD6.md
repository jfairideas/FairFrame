# FairFrame Build 6 Changelog

Major systems and strategic changes across Builds 6A, 6B, and 6C.

---

## Build 6A — Progression Foundation

**Strategic shift:** FairFrame moves from one-off analysis to a platform that **remembers** creator growth.

### Added
- `profiles` progression fields: `current_fair_level`, `total_frames_analyzed`, `rolling_average_fair_score`, `highest_fair_score`, `best_classification`
- `visual_dna` table and recalculation service
- Normalized columns on `analysis_history` (fair_score, classification, strengths, attention drivers, etc.)
- FairLevel ladder: Observer → Chief Approved (+ Fair Circle invite-only)
- 9-tier internal FairScore classification + public-facing level requirements
- Screens: `/progress`, `/dna`, `/profile`
- Signed-in navigation from Home and Results
- `fairLevel.ts`, `progression.ts`, `visualDNA.ts` services

### Changed
- `analysisHistory.ts` — saves normalized fields, triggers async profile + DNA updates
- `parseChiefResponse.ts` — derives classification and attention drivers
- `highest_fair_score` — lifetime max (not rolling-window max)

### Removed
- Orphan components: `ChiefObservation.tsx`, `ScoreRing.tsx`

### Database
- `20250610120000_build_6a_progression_foundation.sql`

---

## Build 6B — Identity & Recognition Layer

**Strategic shift:** FairFrame becomes **visible** — creators can export recognition artifacts.

### Added
- **Press Card** pipeline: classification → view model → preview → PNG export
- Official **FairFrame mark** (`assets/brand/`, `FairFrameMark.tsx`)
- Tri-color card atmosphere tokens (handbook-aligned)
- `fair_cards` table — metadata only (`display_serial`, score, classification, payload JSON)
- Card preview screen with Save and Share
- PRESS CARD entry on Results (after FairScore)
- 5-tier public card classification (Developing, Strong, Exceptional, Chief Approved, Historic)
- Serial format: `FF-YYYY-XXXXXX`
- `react-native-view-shot`, `expo-sharing`, `expo-media-library`

### Build 6B Stabilization (post-audit)
- Historic FairScore contrast fix (platinum/white on dark placard)
- Metadata dedup: one `fair_cards` row per `user_id + analysis_id + card_type`
- Partial unique index `fair_cards_user_analysis_press_unique`

### Build 6B Visual Polish + Card System V2
- `expo-linear-gradient` tri-color atmosphere
- Tier-specific **ceremony recipes** (Potential, Recognition, Prestige, Endorsement, Legacy)
- Museum placard footer — classification as award title
- Photo zone ~81% of 1080×1350 canvas
- `/card-ceremony-audit` — five-tier founder visual matrix

### Preserved
- Live Chief edge function (unchanged)
- Build 6A progression screens and services
- Session-local image strategy (no Storage)

### Database
- `20250612120000_build_6b_card_metadata.sql`
- `20250613120000_build_6b_card_metadata_dedup.sql`

---

## Build 6C — Retention, Trust, Progression Integrity

**Strategic shift:** FairFrame becomes **durable** — retention loops, ethical guardrails, quality-weighted progression.

### Added — Retention
- **ProgressWidget** (compact + expanded) on Home, Results, Profile, Progress
- **JourneyBar** — full public level path with current position highlighted
- **AnalysisRemainingPill** — `Today: X / 15 analyses used`
- `get_my_daily_analysis_usage()` RPC

### Added — Progression integrity
- Provisional FairLevel gates combining **frames + rolling avg FairScore**
- `LevelRequirementCard` — next-level requirements with quality hints
- Copy: *"You have the frame count. Raise your rolling average to continue."*

### Added — Trust (Ethics Layer)
- `ethicsScreen.ts` — server-side screening before Chief (GPT-4o-mini)
- Green / Yellow / Red tiers with structured reason codes
- `/ethics-refusal` — no score, no card, no progression for Red
- `EthicsNotice` on Results; PRESS CARD gated for Yellow
- `ethics_screenings` table
- `analysis_history` ethics columns: `safety_tier`, `ethics_reason_code`, `recognition_allowed`, `progress_contributed`

### Added — Foundation
- `milestones` table + `milestones.ts` (scaffold events)
- `analytics_events` table + `analytics.ts` (calibration tracking)
- Feature flags: `src/config/build6c.ts`

### Changed
- `analyze-frame` edge function — ethics before daily slot reservation and Chief
- `chief.ts` — handles ethics refusal responses
- `analysis-loading.tsx` — ethics-aware flow
- `fairLevel.ts` thresholds — Storyteller 50+5.0, VJ 150+5.8, Craftsman 400+6.5, Master 1000+7.2

### Preserved
- Press Card V2 ceremony system
- Card metadata dedup
- Visual DNA recalculation
- No Storage, Stripe, social, Top 100, public profiles

### Database
- `20250614120000_build_6c_retention_trust.sql`

---

## Cross-Build Strategic Themes

| Era | FairFrame becomes… |
|-----|-------------------|
| Pre-6 | AI critique tool — Chief + FairScore |
| 6A | Memory platform — progression + DNA |
| 6B | Recognition platform — Press Cards |
| 6C | Trusted growth platform — retention + ethics |

---

## Known Pending Items (Not Blockers for This Changelog)

- Deploy `analyze-frame` with ethics to production
- Founder device verification across all builds
- Press Card V2 founder visual PASS on five-tier matrix
- FairLevel threshold calibration with real user distributions
