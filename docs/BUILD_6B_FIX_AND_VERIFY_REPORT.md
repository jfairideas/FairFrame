# FairFrame Build 6B — Fix + Verify Report

**Date:** 2025-06-13  
**Directive:** `FAIRFRAME_BUILD_6B_FIX_AND_VERIFY_DIRECTIVE.docx`  
**Mode:** Targeted patch only — no Build 6C scope

---

## Summary

Both high-priority audit issues are resolved in code and database. Build 6B is **conditionally stable** pending a signed-in device smoke test on the founder's phone.

| Priority | Issue | Status |
|----------|-------|--------|
| High | Historic FairScore contrast | **Fixed** |
| High | Duplicate `fair_cards` rows | **Fixed** |
| Medium | Brand asset verification | **Verified (static assets only)** |
| Required | Device smoke test | **Pending founder device run** |

---

## 1. Historic FairScore Contrast Fix

**Problem:** Historic tokens use `primary: #050505` on placard `#0A0A0B`, making score and classification nearly invisible.

**Solution:** Added `getCardTextColors()` in `src/theme/cardColors.ts`. Historic cards now render:
- **FairScore:** `#D7DCE2` (platinum / secondary)
- **Classification:** `#FFFFFF` (accent)
- **Serial + FAIRSCORE label:** `#D7DCE2` (secondary)

Border/aura/atmosphere still use locked `primary #050505` via `CardAtmosphere` — unchanged.

**Changed files:**
- `src/theme/cardColors.ts` — `CardTextColors`, `getCardTextColors()`
- `src/components/cards/FairScoreLens.tsx` — uses `textColors.score` / `textColors.serial`
- `src/components/cards/CardPlacard.tsx` — resolves text colors per classification
- `src/components/cards/PressCard.tsx` — removed unused atmosphere token pass-through

**Other tiers:** Developing, Strong, Exceptional, Chief Approved still use `primary` for score/classification and `secondary` for serial — unchanged behavior.

---

## 2. Metadata Deduplication Fix

**Problem:** Every `/card-preview` mount called `saveFairCardMetadata()` with a new insert and serial.

**Solution (app layer):**
- `saveFairCardMetadata()` now **selects first** by `user_id + analysis_id + card_type`
- Returns existing `display_serial` when found
- Skips DB write when `analysis_id` is missing (session-only preview)
- On unique-violation race (`23505`), re-fetches existing row before retrying serial

**Solution (database):**
- Migration `20250613120000_build_6b_card_metadata_dedup.sql`
- Removes duplicate press rows (keeps earliest per user+analysis)
- Partial unique index: `fair_cards_user_analysis_press_unique` on `(user_id, analysis_id, card_type)` where `analysis_id IS NOT NULL AND card_type = 'press'`

**Changed files:**
- `src/services/cardMetadata.ts`
- `supabase/migrations/20250613120000_build_6b_card_metadata_dedup.sql`

**Live migration status:** Applied to project `eaficgjjvtekrqcxlaoy` as `build_6b_card_metadata_dedup` (version `20260606063005`).

**Index confirmed live:**
- `fair_cards_user_analysis_press_unique` ✓

**Current `fair_cards` row count:** 0 (no device smoke test has created rows yet).

---

## 3. Brand Asset Verification

**`assets/brand/` contents:**
- `fairframe_mark_black_transparent_1024.png`
- `fairframe_mark_white_transparent_1024.png`
- `fairframe_mark_blue_transparent_1024.png`
- `fairframe_mark_black_on_white_1024.png`
- `fairframe_mark_white_on_black_1024.png`
- `fairframe_mark_v1_vector_trace.svg`

**`FairFrameMark.tsx`:** Imports committed static PNGs only via `require()` — no runtime generation, no circle/badge/avatar geometry.

**SVG geometry:** F-stem + horizontal bars + 42° progression wedge — matches handbook v1.1 script (`scripts/generate-brand-mark.mjs`). No new logos generated during this patch.

**Founder action:** Visually confirm PNGs match approved emblem v1 on device preview.

---

## 4. Test Results

### Automated

| Check | Result |
|-------|--------|
| IDE linter on changed files | Pass — no errors |
| `npx tsc --noEmit` (app layer) | Pass — only pre-existing Deno edge-function noise |
| `npm run lint` | Skipped — Expo CLI network fetch failed in sandbox |
| Live migration apply | Pass — dedup migration + unique index |
| `fair_cards` unique index | Present in `pg_indexes` |

### Device Smoke Test (Required — Not Run Here)

Cursor cannot complete on-device verification (no Xcode / physical device in this environment). Founder should run:

```bash
cd /Users/jfair/fairframe && npx expo start --clear
```

Use **Expo Go on phone** (not web). Sign in as `austinfairtt@gmail.com`.

| Test | Expected | Status |
|------|----------|--------|
| Analysis → Results → PRESS CARD | Preview shows image, score, classification, creator, serial, emblem | **Pending device** |
| Reopen same card preview 3× | `fair_cards` count stays 1 for that `analysis_id` | **Pending device** |
| Historic score (9.0+) | Platinum/white score readable on dark placard | **Code fixed — pending screenshot** |
| Save | Photo library save or permission prompt | **Pending device** |
| Share | Native share sheet with PNG | **Pending device** |
| Results without regression | PRESS CARD entry unchanged | **Pending device** |

**DB verification query after smoke test:**

```sql
SELECT analysis_id, display_serial, COUNT(*)
FROM fair_cards
WHERE card_type = 'press'
GROUP BY analysis_id, display_serial
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

---

## 5. Remaining Risks

1. **Device smoke test not executed** — Save/Share and end-to-end metadata row creation unverified on hardware.
2. **Founder visual sign-off on emblem PNGs** — Assets are committed and static; visual match to approved v1 not confirmed in this sprint.
3. **No `analysis_id` sessions** — Metadata intentionally skipped; serial shown is session-local only.
4. **Concurrent first-open race** — Handled via unique index + re-fetch; extremely unlikely duplicate in practice.

---

## 6. CTO Gate

| Criterion | Met? |
|-----------|------|
| Historic FairScore readable | Yes (code) |
| `fair_cards` idempotent per analysis | Yes (code + DB index) |
| Build 6A/6B flows preserved | Yes — no scope added |
| Signed-in device smoke test | **No — blocker for full Go** |

**Recommendation:** **Conditional Go for 6C planning** after one signed-in device pass (analysis → PRESS CARD → save/share → confirm single `fair_cards` row).

---

## Changed Files (This Patch)

```
src/theme/cardColors.ts
src/components/cards/FairScoreLens.tsx
src/components/cards/CardPlacard.tsx
src/components/cards/PressCard.tsx
src/services/cardMetadata.ts
supabase/migrations/20250613120000_build_6b_card_metadata_dedup.sql
docs/BUILD_6B_FIX_AND_VERIFY_REPORT.md
```

**Not changed:** Live Chief edge function, FairLevel, Visual DNA, Progress, Profile, classification ranges, Press Card layout, Supabase Storage, billing/social.
