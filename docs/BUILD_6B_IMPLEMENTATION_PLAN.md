# Build 6B Implementation Plan

**Source of truth:** FAIRFRAME_MASTER_HANDBOOK v1.1  
**Scope:** Identity & Recognition Layer — Press Card only

## Phase 1 — Foundation
- `assets/brand/` emblem PNGs from handbook geometry SVG
- `src/theme/cardColors.ts` — tri-color tokens
- `src/types/cards.ts` — CardClassification, PressCardViewModel
- `src/services/cardClassification.ts` — 5-tier public mapping from FairScore

## Phase 2 — Services
- `cardVerification.ts` — serial `FF-YYYY-XXXXXX`
- `cardEngine.ts` — build view model from session + profile
- `cardMetadata.ts` — insert `fair_cards` row
- Migration `20250612120000_build_6b_card_metadata.sql`

## Phase 3 — Components
- `FairFrameMark`, `FairScoreLens`, `CardAtmosphere`, `CardPlacard`, `PressCard`, `CardPreviewActions`

## Phase 4 — Screens & wiring
- `app/card-preview.tsx`
- `results.tsx` — PRESS CARD button (after FairScore section)
- `SessionContext` — `analysisHistoryId`
- `analysisHistory.ts` — return inserted row id

## Phase 5 — Export
- `react-native-view-shot` + `expo-sharing` + `expo-media-library`
- Save/share without image upload

## Preserved unchanged
Live Chief, analysis-loading, FairLevel, Visual DNA, Progress, Profile

## Explicitly excluded
Storage, Stripe, social, Fair Circle, milestone/signature cards (scaffold types only)
