# FairFrame — Product Overview

Founder-facing overview. Accurate as of Build 6C (June 2026).

---

## Mission

**Teach People How To See.**

---

## Vision

To become the world's most trusted platform for developing visual judgment — where creators build a credible progression path, earn recognition for craft, and trust that FairFrame refuses to reward harmful content.

---

## The Problem

Modern photography platforms optimize for speed, volume, and engagement metrics. They rarely help a creator answer:

- What did a human actually notice in my frame?
- Did that attention create value?
- Am I getting better over time — not just posting more?

Generic AI scores feel arbitrary. Social feeds reward quantity. There is no durable system for **visual growth**.

---

## Why Existing Platforms Fail

| Gap | Typical platform | FairFrame direction |
|-----|------------------|---------------------|
| Feedback | Likes, filters, generic AI labels | Chief mentorship with observation-first analysis |
| Progression | Follower counts | FairLevel — frames + rolling FairScore quality |
| Recognition | Ephemeral posts | Press Cards — exportable recognition artifacts |
| Trust | No content standards | Ethics Layer before scoring |
| Identity | Public performance | Visual DNA from analyzed work (private, signed in) |

---

## The FairFrame Approach

1. **Capture or upload** a single frame
2. **Ethics Layer** checks content eligibility (Green / Yellow / Red)
3. **Chief analyzes** what humans notice and whether it creates value
4. **FairScore** measures craft on a 0–10 scale
5. **Progression updates** — FairLevel, Visual DNA, history (eligible analyses only)
6. **Press Card** — optional recognition artifact for eligible work
7. **Return** — Progress Widget and Journey Bar show where you are and what is next

FairFrame rewards **growth**, not raw upload volume. FairLevel advancement requires both practice (frames analyzed) and quality (rolling average FairScore) beyond early tiers.

---

## Product Philosophy

- **Photo-first** — the image is the hero; scores and metadata support the photograph
- **Mentorship over judgment** — Chief assigns one next step, not a verdict
- **Recognition requires merit + eligibility** — no score for disallowed content
- **Professional tone** — no casino language, shame, or manipulative scarcity
- **Calibration over certainty** — FairLevel thresholds are provisional until real usage data exists
- **Session-local images** — Press Cards render from the current session; metadata persists, images do not (by design)

---

## Core Systems (Implemented)

### Chief
AI Chief Photographer. Reacts like a field mentor, lists what was seen, scores with FairScore, explains strengths, assigns one next action, and offers expandable deep analysis.

### FairScore
0–10 measure of how effectively an image captures attention, communicates purpose, and creates viewer value through craft.

### FairLevel
Public progression ladder: Observer → Storyteller → Visual Journalist → Craftsman → Master → Chief Approved. Fair Circle is invite-only and not shown as earnable.

### Press Cards
1080×1350 recognition artifacts with tier-specific ceremony atmosphere, museum placard footer, FairFrame emblem, serial (`FF-YYYY-XXXXXX`), save and share. Metadata stored in `fair_cards`; images are not hosted in cloud storage.

### Visual DNA
Per-user visual identity derived from analysis history — dominant archetype, trait badges, strengths, subject lean. Premium DNA sections are scaffolded placeholders (not billing-active).

### Ethics Layer
Server-side screening before Chief. Green = full path. Yellow = analysis with limited recognition/sharing. Red = refusal — no score, no card, no progression.

---

## Current Stage

**Closed Beta Preparation**

| Completed in code | Pending for beta lock |
|-----------------|----------------------|
| Builds 6A, 6B, 6C | Founder device smoke tests |
| Press Card V2 ceremony | Edge function deploy for ethics |
| Progress Widget + Journey Bar | FairLevel threshold calibration with real users |
| Ethics Layer architecture | Founder visual sign-off on Press Cards |

---

## Future Vision (Not Yet Built)

Listed as considerations only — not current product claims:

- Milestone ceremonies and achievement economy (foundation scaffolded in 6C)
- Weekly progress reports
- FairLevel calibration from production score distributions
- Closed beta feedback loop and pricing design
- Subscriptions / premium tiers (no Stripe or IAP today)
- Public profiles, Top 100, social feeds
- Permanent image storage and cross-device card history
- Frame, milestone, and signature card types (DB scaffold only)

See [ROADMAP.md](ROADMAP.md).

---

## Founder

**Jeremy Fair** — photojournalist, visual storyteller, drone pilot.

FairFrame exists because visual judgment is a skill developed through deliberate practice — not better hardware alone.
