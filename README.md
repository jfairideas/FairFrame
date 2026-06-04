# FairFrame

**Your Pocket Chief Photographer.**

AI-powered visual storytelling coach for photographers, MMJs, videographers, and field shooters.

## Features

- Full MVP screen flow (welcome → auth → camera → analysis → scorecard results)
- **Supabase Auth** — email/password, magic link, Google, Apple, anonymous guest
- **OpenAI Chief** — via Supabase Edge Function `analyze-frame` (keeps API key server-side)
- **Analysis history** — saved for signed-in (non-guest) users with RLS
- Dark professional UI + generated viewfinder app icons

## Stack

- **Expo SDK 54** (React Native 0.81, React 19)
- **Expo Router 6**
- **Supabase** + Edge Function for OpenAI Chief

## Quick start

**Expo SDK 54** — required for current Expo Go on iOS/Android.

**Node version:** Use **Node 22 LTS** (not Node 24), minimum **20.19.4**.

```bash
node -v   # should be v22.x (e.g. v22.22.0)
```

```bash
cd ~/fairframe
cp .env.example .env
# Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

npm install
npx expo install --fix
npm run generate-icons   # optional — branded PNG assets
npx expo start
```

**Phone testing:** see [START.md](./START.md) if Expo Go or localhost:8081 does not work.

**Live Chief (OpenAI):** see [docs/LIVE_CHIEF_INTEGRATION.md](./docs/LIVE_CHIEF_INTEGRATION.md) — reports show **LIVE CHIEF** or **OFFLINE PREVIEW** at the top.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **publishable (anon) key** into `.env`.
3. Apply the schema:

   ```bash
   supabase link --project-ref YOUR_REF
   supabase db push
   ```

   Or run `supabase/migrations/20250601180000_init_fairframe.sql` in the SQL editor.

4. **Auth providers** (Authentication → Providers):
   - Enable **Email**
   - Enable **Google** and **Apple** (add OAuth client IDs)
   - Enable **Anonymous** sign-ins (for guest mode)

5. **Redirect URLs** (Authentication → URL Configuration):
   - `fairframe://auth/callback`
   - `exp://127.0.0.1:8081/--/auth/callback` (Expo Go)

## OpenAI / Edge Function

Deploy the Chief analyzer:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase functions deploy analyze-frame
```

The app calls `analyze-frame` with the frame as base64. If the function is unavailable, Chief falls back to an offline preview analysis.

`verify_jwt` is disabled on the function so guests can analyze; authenticated users still send their JWT for future rate-limiting.

## Project structure

```
app/                         # Expo Router screens
src/
  lib/                       # Supabase client, OAuth session helper
  context/                   # Auth + capture session state
  services/                  # chief.ts, analysisHistory, mockChief
supabase/
  migrations/                # profiles + analysis_history (RLS)
  functions/analyze-frame/   # OpenAI vision + JSON scorecard
scripts/generate-icons.mjs   # Viewfinder brand assets
```

## Environment variables

| Variable | Where |
|----------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` |
| `OPENAI_API_KEY` | Supabase Edge Function secret only |

Never put OpenAI keys in `EXPO_PUBLIC_*` variables.

## Next steps

- FairScore aggregation from `analysis_history`
- Image storage bucket for frame thumbnails
- Achievements and subscriptions

## License

Private — FairFrame.
