# FairFrame Ethics Charter

**Purpose:** Protect trust in FairScore, FairLevel, Chief Approved, Historic recognition, Visual DNA, and Press Cards.

**Status:** Implemented in Build 6C (server-side screening before Chief).

---

## Core Principles

1. **FairFrame teaches people how to see.** The product exists to develop visual judgment — not to amplify harmful subject matter.

2. **FairFrame does not reward harmful content.** Recognition is withheld when content violates eligibility rules.

3. **Recognition requires Visual Merit + Ethical Eligibility.** A technically strong photograph of disallowed content does not receive FairScore, classification, Press Cards, or progression credit.

4. **FairFrame analyzes photography; it does not endorse harmful subject matter.** Analysis of sensitive documentary work may proceed under restrictions — endorsement and public recognition may not.

5. **Trust is the company's most valuable asset.** FairFrame may refuse recognition regardless of photographic quality.

---

## Ethics Layer

Content screening runs **before** Chief analysis on the Live Chief path. The client displays outcomes; the edge function is authoritative.

### Green — Allowed

**Examples:** Portraits, sports, street photography, nature, architecture, normal documentary scenes.

**Allowed:**
- Chief analysis
- FairScore and classification
- FairLevel and Visual DNA progression
- Press Card creation and export (when otherwise eligible)

### Yellow — Sensitive, Potentially Legitimate

**Examples:** Injury documentation, disaster coverage, medical context, war/reporting images, crime aftermath without exploitative framing.

**Allowed with restrictions:**
- Chief analysis may proceed
- FairScore recorded
- Progression may update
- **Recognition limited** — Press Card and sharing may be restricted; user sees a sensitive-image notice

**UX copy:** *"This image appears sensitive. FairFrame can analyze visual craft, but recognition and sharing may be limited."*

### Red — Disallowed

**Examples:** Sexual exploitation, CSAM, non-consensual nudity, torture, extreme gore, hate propaganda, animal torture, abusive or exploitative content.

**Not allowed:**
- Chief analysis
- FairScore (never show 0.0 as a substitute — refusal is not a score)
- Classification or Press Card
- FairLevel or Visual DNA progression
- Analysis history with a fake score

**UX copy:** *"FairFrame cannot analyze or score this image because it appears to violate our content eligibility rules."*

---

## Documentary Exception Philosophy

FairFrame has roots in journalism and documentary photography. Sensitive images are not automatically treated as exploitative.

| Context | Policy |
|---------|--------|
| Disaster aftermath | Yellow — analysis may proceed; public cards/sharing may be limited |
| Medical scene | Yellow — if non-exploitative and non-identifying |
| War or conflict coverage | Yellow — analysis with restrictions |
| Graphic gore without public-interest context | Red or Yellow by severity |
| Exploitation or abuse | Red — no exception |

Journalism can be visually important without being automatically eligible for **public recognition artifacts**.

---

## Structured Reason Codes

The Ethics Layer returns machine-readable codes for auditing (no image storage):

| Code | Tier | Meaning |
|------|------|---------|
| `safe_general` | Green | Normal eligible image |
| `sensitive_documentary` | Yellow | Legitimate documentary/news context |
| `sensitive_medical` | Yellow | Medical or injury-related |
| `sensitive_violence_context` | Yellow | Violence/disaster without exploitation |
| `disallowed_sexual_exploitation` | Red | Sexual exploitation |
| `disallowed_csam` | Red | Child sexual abuse material |
| `disallowed_extreme_gore` | Red | Extreme gore/torture |
| `disallowed_hate_propaganda` | Red | Hate propaganda |
| `uncertain_restrict` | Yellow | Uncertain — limited path |
| `screening_unavailable` | — | Offline/fallback path |

---

## Trust Principles

- **No score on refusal** — eligibility decisions are not FairScores
- **Red does not consume daily analysis credit** on the server path (screening occurs before slot reservation)
- **No storage of disallowed images** in FairFrame infrastructure
- **Conservative fallback** — when screening is uncertain, prefer limited handling over unsafe scoring
- **No detailed moderation hints** that help bad actors test boundaries

---

## What FairFrame Protects

| Asset | Protected by ethics |
|-------|---------------------|
| FairScore credibility | No scores for disallowed content |
| FairLevel integrity | No progression from Red analyses |
| Chief Approved / Historic meaning | Recognition requires eligibility |
| Press Cards | No cards for Red; limited for Yellow |
| Visual DNA | No DNA contribution from Red |
| Brand trust | Refusal without shame or accusation |

---

## Implementation Reference

- Server: `supabase/functions/analyze-frame/ethicsScreen.ts`
- Client refusal: `app/ethics-refusal.tsx`
- Results notice: `src/components/ethics/EthicsNotice.tsx`
- Database: `ethics_screenings` table; `analysis_history.safety_tier` columns

Deploy ethics screening: `npx supabase functions deploy analyze-frame`
