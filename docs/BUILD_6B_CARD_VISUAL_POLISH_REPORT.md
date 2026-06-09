# FairFrame Build 6B — Card Visual Polish Report

**Date:** 2025-06-13  
**Directive:** `FAIRFRAME_BUILD_6B_CARD_VISUAL_POLISH_DIRECTIVE.docx`  
**Mode:** Visual polish only — no scope expansion

---

## Summary

Press Card visuals upgraded from single-color border to **tri-color layered atmosphere**, with **museum placard footer hierarchy** and **photo-first proportions** (~81% photo zone). Save/Share, serial, metadata dedup, and official mark behavior are unchanged.

---

## Before → After

| Area | Before | After |
|------|--------|-------|
| Atmosphere | Single `primary` border + secondary shadow | Gradient border (primary→secondary→accent), halo, hairline, corner blooms |
| Photo share of canvas | ~76% (1030px) | **~81%** (1094px) |
| FairScore size | 72px base | **61px** (~15% reduction) |
| Classification | 28px scale, right-aligned secondary | **36px** scale, left-aligned emotional headline |
| Footer layout | Score block + metadata row | Museum placard: classification → score → cert row |
| Mark size | 56px | **44px** certification mark |
| Dependencies | — | `expo-linear-gradient` (Option A) |

---

## Changed Files

```
package.json / package-lock.json     — expo-linear-gradient
src/theme/cardColors.ts              — getCardAtmosphereTokens(), hexToRgba helpers
src/components/cards/CardAtmosphere.tsx — tri-color gradient frame (full rewrite)
src/components/cards/CardPlacard.tsx  — museum placard hierarchy
src/components/cards/FairScoreLens.tsx — reduced score size, scale-aware
src/components/cards/PressCard.tsx    — 81% photo layout, gap before placard
src/types/cards.ts                   — updated CARD_LAYOUT constants
docs/BUILD_6B_CARD_VISUAL_POLISH_REPORT.md
```

**Not changed:** `cardMetadata.ts` (dedup intact), `card-preview.tsx` (uses PressCard — preview matches export), Live Chief, FairLevel, Visual DNA, Supabase Storage.

---

## Tri-Color Atmosphere (CardAtmosphere)

Per classification, all three locked tokens are used together:

1. **Outer halo** — secondary at ~38% opacity + secondary-colored shadow
2. **Main border** — `LinearGradient` primary → secondary → accent (diagonal)
3. **Inner hairline** — 1px accent at ~55% opacity on photo frame edge
4. **Corner blooms** — secondary (top-left) and accent (bottom-right) orbs

Color is applied **outside** the photograph only. No tint, filter, or overlay on the image.

---

## Museum Placard Hierarchy (CardPlacard)

1. **Classification** — large left headline (emotional tier label)
2. **FairScore** — smaller right-aligned measurement with FAIRSCORE label
3. **Certification row** — creator + serial (quiet), official FairFrame mark (44px)

Historic cards retain platinum/white text colors from the prior contrast fix.

---

## Layout Constants

```ts
// 1080×1350 — sums to 1350
outerMargin: 28
photoHeight: 1094   // ~81%
placardGap: 16
placardHeight: 212  // ~16%
markWidth: 44
```

Export target remains **1080×1350** at 4:5 ratio via `react-native-view-shot` in `card-preview.tsx`.

---

## Acceptance Tests

| Test | Status |
|------|--------|
| Five classification renders | **Pending device screenshots** |
| Three atmosphere colors visible per tier | **Implemented** — verify on device |
| Historic score readable on dark placard | **Preserved** (prior fix) |
| FairScore does not dominate photo | **Implemented** (61px vs 72px, right-aligned) |
| Classification more prominent | **Implemented** (36px left headline) |
| Official emblem in footer | **Yes** — 44px white mark |
| Save / Share still work | **Pending device** |
| No Supabase Storage added | **Confirmed** |
| Metadata dedup intact | **Confirmed** — `cardMetadata.ts` untouched |

### Device screenshot checklist (founder)

```bash
cd /Users/jfair/fairframe && npx expo start --clear
```

Use Expo Go on phone. For each tier, run an analysis in that score band (or temporarily mock `fairScore` in dev), then **PRESS CARD → screenshot**:

| Classification | Score band |
|----------------|------------|
| Developing | 0–4.9 |
| Strong | 5.0–6.4 |
| Exceptional | 6.5–7.9 |
| Chief Approved | 8.0–8.9 |
| Historic | 9.0–10.0 |

Confirm: tri-color glow visible, photo is hero, classification reads before score, Save + Share succeed.

---

## Remaining Risks

1. **Screenshots not captured in this sprint** — visual verification requires founder device pass.
2. **Historic atmosphere** — black primary gradient is intentionally restrained; platinum/white stops provide tier identity.
3. **Gradient on Android** — `expo-linear-gradient` is SDK-aligned; verify corner blooms on both iOS and Android if possible.

---

## Founder Standard Check

Target: card feels like a **premium recognition artifact**, not a score dashboard. Photo remains hero; atmosphere is tier-specific and layered; footer reads as issued museum placard.
