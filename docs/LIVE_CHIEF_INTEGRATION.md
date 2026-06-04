# Live Chief Integration

Source of truth: [FOUNDER_BIBLE_V1.md](./FOUNDER_BIBLE_V1.md)

## Current pipeline

```
Capture / Upload (app)
    → SessionContext stores imageUri + phase + optional storyContext
    → analysis-loading.tsx calls analyzeWithChief()
         → chief.ts
              ├─ No .env Supabase? → mockChief.ts → OFFLINE PREVIEW
              ├─ supabase.functions.invoke("analyze-frame")
              │     → Edge Function (OpenAI key in Supabase secrets only)
              │     → GPT-4o vision + Chief Constitution prompt
              │     → JSON → parseChiefResponse.ts → LIVE CHIEF
              └─ On any error → mockChief.ts → OFFLINE PREVIEW (+ reason shown)
    → results.tsx shows banner: LIVE CHIEF | OFFLINE PREVIEW
```

OpenAI API key is **never** in the mobile app.

## Setup (one-time)

### 1. App `.env`

```bash
cp .env.example .env
```

Set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Restart Expo: `npx expo start --clear`

### 2. Supabase secrets

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

### 3. Deploy edge function

```bash
supabase functions deploy analyze-frame
```

### 4. Verify

Run an analysis on device. Report header should show **LIVE CHIEF** (green).

If you see **OFFLINE PREVIEW** (amber), read the reason line under the banner — common causes:

- Missing or wrong `.env`
- `analyze-frame` not deployed
- `OPENAI_API_KEY` not set in Supabase secrets
- Network / function error (message shown in dev console)

## Structured JSON fields

| Doc / API alias | App field |
|-----------------|-----------|
| `chiefsFirstImpression` | `firstImpression` |
| `scene` | `sceneIdentification` |
| `pillarScores` | `pillars` |
| `visibleObjects` | `visibleObjects` |
| `visualHierarchy` | `visualHierarchy` |
| `visualStorytellingScore` | `visualStorytellingScore` |
| `potentialScore` | `potentialScore` |
| `whatChiefSees` | `whatChiefSees` |

## Files

- `src/services/chief.ts` — live vs fallback orchestration
- `src/services/parseChiefResponse.ts` — JSON normalization
- `src/services/mockChief.ts` — offline preview only
- `supabase/functions/analyze-frame/` — secure OpenAI proxy
- `src/components/ChiefSourceBanner.tsx` — LIVE / OFFLINE label
