#!/usr/bin/env bash
# Founder-only Live Chief: set allowlisted emails on Supabase (server-side enforcement).
# Usage: FOUNDER_EMAILS="you@example.com" ./scripts/set-founder-secrets.sh

set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="${SUPABASE_PROJECT_REF:-eaficgjjvtekrqcxlaoy}"

if [[ -z "${FOUNDER_EMAILS:-}" ]]; then
  echo "Set FOUNDER_EMAILS to your signed-in Supabase account email, e.g.:"
  echo '  FOUNDER_EMAILS="jeremy@example.com" ./scripts/set-founder-secrets.sh'
  exit 1
fi

if ! npx supabase@2.30.4 projects list &>/dev/null; then
  echo "Log in first: npx supabase@2.30.4 login"
  exit 1
fi

npx supabase@2.30.4 secrets set "FOUNDER_EMAILS=${FOUNDER_EMAILS}" --project-ref "${PROJECT_REF}"
echo "Set FOUNDER_EMAILS on project ${PROJECT_REF}"
echo "Also add to .env: EXPO_PUBLIC_FOUNDER_EMAIL=<same email>"
