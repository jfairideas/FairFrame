# Sprint 3 — Chief Observes, Not Assumes

Source of truth: [FOUNDER_BIBLE_V1.md](./FOUNDER_BIBLE_V1.md)

## Delivered

1. **Four-step analysis** before scores (scene → objects → hierarchy → pillars)
2. **Chief's First Impression** at top of report (after hero image)
3. **Scene identification** + **visible objects** + **visual hierarchy** (1st/2nd/3rd + why)
4. **`hasPrimarySubject`** — Chief never assumes a face/subject without seeing one
5. **Report order:** Image → Observe → **Evaluation** (scores) → coaching lists
6. Mock templates: kitchen (no subject) vs portrait (subject) with object-grounded copy
7. Edge function prompt aligned

## Redeploy

```bash
supabase functions deploy analyze-frame
```

## Test

```bash
npx expo start --clear
```

Read **Chief's first impression** and **Visible in frame** before scrolling to scores.
