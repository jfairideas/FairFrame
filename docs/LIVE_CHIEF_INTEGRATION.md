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

## Founder-only beta protections

Live Chief is gated for founder testing:

| Layer | Behavior |
|-------|----------|
| **Edge function** | Requires valid JWT; email must be in `FOUNDER_EMAILS` secret |
| **Default** | If `FOUNDER_EMAILS` is unset, all live calls return 503 (no OpenAI spend) |
| **Daily cap** | 20 Live Chief analyses per founder per UTC day |
| **Rate limit** | Minimum 15 seconds between analyses per founder |
| **Dedup** | Duplicate `requestId` from the app is rejected (prevents effect re-runs) |
| **Client** | Non-founders skip `invoke` and use offline preview when `EXPO_PUBLIC_FOUNDER_EMAIL` is set |
| **JWT** | `verify_jwt = true` on `analyze-frame` |

Guests and other signed-in users always receive **OFFLINE PREVIEW** without OpenAI cost.

## Setup (one-time)

### 1. App `.env`

```bash
cp .env.example .env
```

Set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_FOUNDER_EMAIL` (same email as your Supabase sign-in)

Restart Expo: `npx expo start --clear`

### 2. Supabase secrets

```bash
FOUNDER_EMAILS="your@email.com" ./scripts/set-founder-secrets.sh
OPENAI_API_KEY=sk-your-key-here ./scripts/set-openai-secret.sh
```

Apply `supabase/migrations/20250604120000_chief_daily_usage.sql` before deploying the function.

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
