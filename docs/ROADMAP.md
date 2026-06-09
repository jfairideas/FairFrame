# FairFrame Roadmap

Accurate product history and future considerations. **Do not treat future items as shipped.**

---

## Completed — Build 6A (Progression Foundation)

**Theme:** Make FairFrame remember and reward growth over time.

- Postgres migration: normalized `analysis_history` columns, `profiles` progression aggregates, `visual_dna` table
- **FairLevel** ladder with rolling average FairScore (100-frame window)
- **Visual DNA** recalculation from history
- Screens: Progress, Visual DNA, Profile
- Navigation from Home and Results when signed in
- Services: `fairLevel.ts`, `progression.ts`, `visualDNA.ts`, `analysisHistory.ts`
- Orphan cleanup: removed unused Sprint components

**Preserved:** Live Chief, Sprint 4 Results flow, capture/upload pipeline.

---

## Completed — Build 6B (Identity & Recognition Layer)

**Theme:** Make FairFrame visible through Press Cards.

- Official **FairFrame emblem** assets (`assets/brand/`)
- **Press Card** system: 1080×1350 export, tri-color atmosphere, museum placard
- **Card System V2** ceremony: tier-specific atmosphere recipes, award footer hierarchy
- 5-tier public card classification (Developing → Historic)
- `fair_cards` metadata table with idempotent dedup per analysis
- Save / Share via view-shot (session-local images — no Supabase Storage)
- Results → PRESS CARD → card-preview flow
- Founder audit screen: `/card-ceremony-audit` (five-tier matrix)

**Preserved:** Build 6A progression, Live Chief edge function, FairScore logic.

---

## Completed — Build 6C (Retention, Trust, Progression Integrity)

**Theme:** Make FairFrame durable — users return, trust the system, advance fairly.

### Retention
- **Progress Widget** — Home, Results, Profile, Progress
- **Journey Bar** — Observer through Chief Approved
- **Analysis Remaining Pill** — daily usage visibility (15/day display cap)

### Progression integrity
- **FairScore-weighted FairLevel** — provisional frame + rolling avg gates
- **LevelRequirementCard** — shows what blocks next level

### Trust
- **Ethics Layer** — Green / Yellow / Red before Chief
- **Ethics refusal screen** — no score on disallowed content
- Yellow: limited Press Card recognition

### Foundation
- `milestones` table (scaffold — not full achievement economy)
- `analytics_events` table (calibration events)
- `ethics_screenings` table

**Preserved:** Press Card V2, card dedup, Visual DNA, Live Chief prompt.

**Pending:** Edge function deploy for live ethics; founder device verification.

---

## Future Considerations (Not Implemented)

These are **exploration areas only**. They are not in the current app.

### Product
- **Milestone ceremonies** — level-up and craft recognition events (DB scaffold exists)
- **Weekly reports** — email or in-app summaries when enough history exists
- **FairLevel calibration** — permanent thresholds from production score distributions
- **Closed beta feedback** — structured founder and tester input before pricing

### Recognition
- Additional card types: Frame, Milestone, Signature (DB `card_type` constraint only)
- Card history gallery across sessions (requires storage strategy decision)
- Founder-final emblem asset replacement if needed

### Platform
- **Subscriptions / premium** — no Stripe, IAP, or paywall today
- **Public profiles** — not built
- **FairFrame Top 100** — not built
- **Social feeds, likes, follows** — explicitly out of scope
- **Permanent image storage** — explicitly out of scope unless founder approves cost/privacy review
- **Fair Circle workflow** — invite-only; not a earnable tier

### Operations
- Upload image normalization for large iPhone album files
- Expo web support (currently phone-first)
- Broader beta beyond founder-only Live Chief

---

## Current Gate

**Closed Beta Preparation**

Before public beta:
1. Deploy `analyze-frame` with ethics screening
2. Founder device pass: analysis → results → progression → Press Card → ethics refusal
3. Five-tier Press Card ceremony visual approval
4. FairLevel threshold review with initial user data

---

## Related Documents

- [CHANGELOG_BUILD6.md](../CHANGELOG_BUILD6.md)
- [BUILD_6C_COMPLETE.md](BUILD_6C_COMPLETE.md)
- [CARD_SYSTEM_V2_IMPLEMENTATION_AND_VISUAL_AUDIT.md](CARD_SYSTEM_V2_IMPLEMENTATION_AND_VISUAL_AUDIT.md)
- [ETHICS_CHARTER.md](ETHICS_CHARTER.md)
