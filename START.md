# FairFrame — run on your phone

> **Product docs:** See [README.md](README.md) for what FairFrame is today (Build 6A/6B/6C).  
> **Quick reference:** [docs/FAIRFRAME_OVERVIEW.md](docs/FAIRFRAME_OVERVIEW.md) · [docs/ROADMAP.md](docs/ROADMAP.md)

## Requirements

- **Expo SDK 54** (matches current Expo Go on the App Store)
- **Node 22 LTS** (`node -v` → `v22.x`, minimum 20.19.4) — not Node 24
- Dependencies installed in this folder

## Fix & start (copy/paste)

```bash
cd ~/fairframe
node -v
npm install
npx expo start
```

If `npm install` fails with peer dependency errors, the project includes `.npmrc` with `legacy-peer-deps=true` — run `npm install` again.

**Stop any old Expo server first** (if port 8081 is busy):

```bash
lsof -i :8081
kill <PID>
```

Keep that terminal open. You should see **Metro waiting on http://localhost:8081** and a **QR code**.

## Open on your phone

1. Install **Expo Go** (App Store / Play Store).
2. Same Wi‑Fi as your Mac (or use tunnel below).
3. **iPhone:** Camera app → scan QR → Open in Expo Go.
4. **Android:** Expo Go → Scan QR code.

FairFrame does **not** appear on the Expo Go home screen until you scan the QR.

## Live Chief (Supabase + OpenAI)

Backend is provisioned for project **`fairframe`** (`eaficgjjvtekrqcxlaoy`):

- Database: `profiles`, `analysis_history` (RLS on)
- Edge function: `analyze-frame` (deployed, JWT verification off)
- App: `~/fairframe/.env` with Supabase URL + anon key

**Founder-only Live Chief** — only your signed-in email can trigger OpenAI (20/day max). Everyone else gets offline preview.

1. In `.env`, set `EXPO_PUBLIC_FOUNDER_EMAIL` to the same email you use to sign in.
2. Set Supabase secrets (never put OpenAI key in `.env`):

```bash
cd ~/fairframe
npx supabase@2.30.4 login
FOUNDER_EMAILS="your@email.com" ./scripts/set-founder-secrets.sh
OPENAI_API_KEY=sk-your-key-here ./scripts/set-openai-secret.sh
npx supabase@2.30.4 functions deploy analyze-frame --project-ref eaficgjjvtekrqcxlaoy
```

Apply migration `20250604120000_chief_daily_usage.sql` via Supabase SQL editor or `db push` if using CLI.

Or in the [dashboard → Edge Functions → Secrets](https://supabase.com/dashboard/project/eaficgjjvtekrqcxlaoy/settings/functions): name `OPENAI_API_KEY`, value your `sk-...` key.

Then restart Expo (`npx expo start --clear`). On Results you should see **LIVE CHIEF** instead of **OFFLINE PREVIEW**.

Optional: [Auth → Providers](https://supabase.com/dashboard/project/eaficgjjvtekrqcxlaoy/auth/providers) — enable **Anonymous sign-ins** for guest mode; add Google/Apple when ready.

## If localhost:8081 fails in the browser

That only matters for **web**. Phone testing uses the **QR / `exp://` URL**, not the browser.

If the terminal shows errors when you run `npx expo start`, the server is not running — fix those first.

## Still stuck?

```bash
cd ~/fairframe
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
npx expo start --tunnel
```

`--tunnel` gives a new QR that works across networks (slower but reliable).

## Common errors we fixed

| Error | Fix |
|-------|-----|
| `ERR_CONNECTION_REFUSED` on :8081 | `npx expo start` not running or crashed |
| Node v24 + type stripping | Use Node 22 |
| `Cannot find module 'expo-modules-core'` | `npm install` + aligned `expo@~52` in package.json |
| `expo-web-browser` plugin error | Removed invalid plugin from app.json |
| `expo-asset` missing | `npx expo install expo-asset expo-font` |
