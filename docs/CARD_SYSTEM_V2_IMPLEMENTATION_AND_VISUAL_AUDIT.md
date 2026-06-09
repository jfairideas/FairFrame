# FairFrame Card System V2 — Implementation + Visual Audit

**Directive:** `FAIRFRAME_CARD_SYSTEM_V2_DIRECTIVE_AND_VISUAL_AUDIT.docx`  
**Date:** 2025-06-08  
**Standard:** Recognition artifact, not card component

---

## Executive Verdict: **Conditional Pass (Pending Founder Visual Approval)**

Card System V2 restructures the Press Card around **ceremony, not components**. The photograph is hero. Classification is the award title. FairScore is supporting evidence. Each tier now has a distinct atmosphere recipe — not a single template with color swaps.

**Code implementation is complete. Visual success is NOT declared** — founder must run the five-card ceremony audit on device and judge emotional impact.

---

## V2 Hierarchy (Implemented)

1. **Photograph** — 81% canvas (`1094px` at 1080×1350)
2. **Classification** — uppercase award title, tier-specific typography
3. **Recognition Atmosphere** — tier-specific frame geometry + ceremony bridge
4. **FairScore** — reduced ceremony score (`44–48px` vs original `72px`)
5. **Creator** — issued certification metadata
6. **Serial** — official record
7. **Emblem** — 40px certification mark

---

## Tier Ceremony Personalities

| Tier | Emotion | Atmosphere | Corner ceremony | Bridge |
|------|---------|------------|-----------------|--------|
| Developing | Potential | Thin border, upward gradient, soft halo | Single ascent bloom | Light |
| Strong | Recognition | Horizontal gradient, balanced frame | Dual balanced blooms | Medium |
| Exceptional | Prestige | Thick border, dramatic diagonal, 4-corner radiant | Quad radiant blooms | Prominent |
| Chief Approved | Endorsement | Emerald→gold 4-stop gradient | Seal corners | Endorsement band |
| Historic | Legacy | Thin archival hairline, restrained halo | Platinum L-corners | Minimal |

---

## Changed Files

```
src/theme/cardCeremony.ts                    — atmosphere recipes + ceremony typography
src/components/cards/CardAtmosphere.tsx    — tier-specific corner ceremonies
src/components/cards/CardCeremonyBridge.tsx  — photo→placard transition band
src/components/cards/CardPlacard.tsx         — award ceremony footer
src/components/cards/FairScoreLens.tsx       — ceremony mode (supporting evidence)
src/components/cards/PressCard.tsx           — bridge + layout
src/types/cards.ts                           — layout constants
src/services/cardCeremonyAudit.ts            — five-tier audit matrix builder
app/card-ceremony-audit.tsx                  — founder visual audit screen
src/lib/appRoutes.ts                         — audit route
```

**Preserved:** `cardMetadata.ts` dedup, Save/Share, classification ranges, Live Chief, no Storage/social/billing.

---

## Founder Visual Audit — Five-Card Matrix

### How to run

```bash
cd /Users/jfair/fairframe && npx expo start --clear
```

On phone (Expo Go), navigate to:

**`/card-ceremony-audit`**

This renders **five Press Cards using the same photograph** in a horizontal scroll:
- Developing (4.0)
- Strong (6.0)
- Exceptional (7.5)
- Chief Approved (8.5)
- Historic (9.5)

### Founder Approval Test

| Result | Meaning |
|--------|---------|
| **PASS** | Five different recognition ceremonies — distinct emotional identity per tier |
| **FAIL** | One template with five color swaps |

### Screenshot requirement

Capture the full horizontal row side-by-side. Also save one exported card from `/card-preview` after a real analysis.

---

## Visual Audit Evaluation (Code + Structure — Device Pending)

| Criterion | Code assessment | Device evidence |
|-----------|----------------|-----------------|
| Atmosphere uniqueness | **Improved** — 5 recipes with distinct geometry | **Pending screenshots** |
| Classification emotion | **Improved** — award title uppercase, 40–44px | **Pending** |
| Museum placard quality | **Improved** — ceremony rule + evidence row | **Pending** |
| Photograph dominance | **Pass (code)** — 81% photo zone | **Pending** |
| Recognition artifact feel | **Directionally correct** | **Pending founder reaction** |
| Award ceremony feel | **Directionally correct** | **Pending** |
| Shareability | **Unknown** — needs exported PNG review | **Pending** |
| Founder emotional reaction | **Cannot evaluate in code** | **Required** |

---

## Museum Test / Award Test

| Test | Code | Founder |
|------|------|---------|
| Gallery wall appropriate? | Structure supports it | **Judge on device** |
| Footer feels like museum placard? | Ceremony rule + cert row | **Judge on device** |
| Photograph celebrated? | 81% hero zone | **Judge on device** |
| Stranger thinks "award" not "AI report"? | Classification-first footer | **Judge on device** |

---

## Historic Contrast

**Preserved.** Historic score/classification use platinum/white on `#0A0A0B` placard. Legacy atmosphere uses archival corners, not near-black text.

---

## Metadata / Export / Regression

| Check | Status |
|-------|--------|
| Metadata dedup | Intact — `cardMetadata.ts` unchanged |
| Save/Share 1080×1350 | Intact — `card-preview.tsx` unchanged |
| No Supabase Storage | Confirmed |
| Classification logic | Unchanged 5-tier handbook mapping |
| Live Chief | Unchanged |

---

## Remaining Risks

1. **Founder visual approval not obtained** — V2 success is emotional, not implementation completeness
2. **Ceremony audit uses splash-icon fallback** if no session image — use real photograph for final audit
3. **Uppercase classification** may feel strong for Developing — founder may prefer title case for lower tiers
4. **Export height** fixed at 1350 with 6px bridge — verify no footer crop on device

---

## Go / No-Go

| Gate | Status |
|------|--------|
| V2 implementation complete | **Yes** |
| Five-card audit screen available | **Yes** (`/card-ceremony-audit`) |
| Founder side-by-side screenshots | **No** |
| Founder emotional PASS on ceremony test | **No** |

**Do not declare Build 6B/V2 locked until founder runs ceremony audit and judges PASS on the five-tier matrix.**
