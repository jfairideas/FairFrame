# FairFrame

**Teach People How To See.**

FairFrame is an AI-powered **visual growth platform** that helps creators develop stronger visual judgment through repetition, feedback, progression, and deliberate practice.

At the center is **Chief** — a veteran chief photographer and visual storyteller who mentors you on attention, communication, value, and craft. FairFrame is not a generic photo scorer. It is a long-term system for learning how humans experience images.

**Repository:** [github.com/jfairideas/FairFrame](https://github.com/jfairideas/FairFrame)

---

## Mission

Teach People How To See.

---

## Core Systems

| System | What it does |
|--------|----------------|
| **Chief** | AI Chief Photographer — reaction, observation, assignment, full analysis |
| **FairScore** | 0–10 assessment of attention, communication, and visual craft |
| **FairLevel** | Long-term progression ladder (Observer → Chief Approved) |
| **Press Cards** | Recognition artifacts — photo-first, tier-specific ceremony, exportable PNG |
| **Visual DNA** | Emerging visual identity from your analyzed frames |
| **Ethics Layer** | Pre-analysis content eligibility (Green / Yellow / Red) before Chief |

See [docs/FAIRFRAME_OVERVIEW.md](docs/FAIRFRAME_OVERVIEW.md) for the full product story.

---

## Current Development Status

**Closed Beta Preparation**

Builds 6A, 6B, and 6C are implemented in code. Founder device verification and edge-function deploy for ethics screening are pending before public beta.

| Build | Theme | Status |
|-------|-------|--------|
| **6A** | Progression foundation — FairLevel, Visual DNA, Progress, Profile | Implemented |
| **6B** | Identity & recognition — Press Cards, brand mark, card metadata | Implemented |
| **6C** | Retention, trust, ethics — Progress Widget, Journey Bar, weighted levels | Implemented |

Details: [CHANGELOG_BUILD6.md](CHANGELOG_BUILD6.md) · [docs/ROADMAP.md](docs/ROADMAP.md)

---

## What You Can Do Today

- Capture or upload a photograph
- Receive Chief analysis (Live Chief for founder beta; offline preview for others)
- View FairScore, reaction, strengths, and assignment on Results
- Track FairLevel, frames analyzed, and rolling average FairScore (signed in)
- Explore Visual DNA archetype and traits (signed in)
- Generate a **Press Card** — preview, save to camera roll, share (eligible images)
- See daily analysis usage and progression on Home, Results, Profile, and Progress

**Not yet implemented:** subscriptions, public profiles, Top 100, social feeds, permanent image storage, weekly reports, full milestone economy.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Mobile app | Expo SDK 54, React Native 0.81, React 19, Expo Router 6 |
| Language | TypeScript 5.9 |
| Backend | Supabase (Auth, Postgres, Row Level Security) |
| Edge functions | `analyze-frame` — ethics screening + Live Chief (OpenAI GPT-4o vision) |
| Card export | `react-native-view-shot`, `expo-sharing`, `expo-media-library` |
| Card atmosphere | `expo-linear-gradient` |

OpenAI API keys live **only** in Supabase secrets — never in the client or repository.

---

## Installation

### Requirements

- Node.js **≥ 20.19.4** (22 LTS recommended)
- Expo Go on a physical device (recommended for testing)
- Supabase project credentials for Live Chief

### Setup

```bash
git clone https://github.com/jfairideas/FairFrame.git
cd FairFrame
npm install
cp .env.example .env
# Edit .env with your Supabase URL, anon key, and founder email
npx expo start --clear
```

Scan the QR code with Expo Go. Use a **phone** — web preview is not supported for full flows.

### Live Chief (founder beta)

1. Set Supabase secrets: `FOUNDER_EMAILS`, `OPENAI_API_KEY`
2. Deploy edge function: `npx supabase functions deploy analyze-frame`
3. Sign in with a founder-allowlisted email

See [START.md](START.md) and [docs/LIVE_CHIEF_INTEGRATION.md](docs/LIVE_CHIEF_INTEGRATION.md).

---

## Project Structure

```
app/                    # Expo Router screens (capture, results, progress, cards, …)
src/
  components/           # UI including cards/, progress/, ethics/
  services/             # Chief, progression, ethics, cards, analytics
  theme/                # Design tokens, card colors, ceremony
supabase/
  migrations/           # Postgres schema (6A, 6B, 6C)
  functions/analyze-frame/  # Ethics + Live Chief
docs/                   # Build reports, ethics charter, roadmap
assets/brand/           # Founder-locked FairFrame emblem
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/FAIRFRAME_OVERVIEW.md](docs/FAIRFRAME_OVERVIEW.md) | Mission, vision, philosophy, stage |
| [docs/ETHICS_CHARTER.md](docs/ETHICS_CHARTER.md) | Content eligibility and trust principles |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Build 6 accomplishments and future considerations |
| [CHANGELOG_BUILD6.md](CHANGELOG_BUILD6.md) | Build 6A / 6B / 6C changelog |
| [START.md](START.md) | Quick start on device |

---

## Ethics & Trust

FairFrame screens content **before** Chief analysis. Disallowed images receive no FairScore, no Press Card, and no progression credit. A refusal is an eligibility decision — not a photograph score.

Read the full policy: [docs/ETHICS_CHARTER.md](docs/ETHICS_CHARTER.md)

---

## Founder

**Jeremy Fair** — 4x New England Emmy-nominated television photojournalist, visual storyteller, FAA Part 107 drone pilot.

> Great images are not created by better cameras. They are created by better observation.

---

## Ownership

FairFrame is a proprietary project by Jeremy Fair. The repository is public for transparency and development. All rights reserved unless otherwise specified.
