#!/usr/bin/env bash
# Set OpenAI key on FairFrame Supabase (required for LIVE CHIEF).
# Usage: OPENAI_API_KEY=sk-... ./scripts/set-openai-secret.sh

set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="${SUPABASE_PROJECT_REF:-eaficgjjvtekrqcxlaoy}"

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "Set OPENAI_API_KEY first, e.g.:"
  echo "  OPENAI_API_KEY=sk-... ./scripts/set-openai-secret.sh"
  exit 1
fi

if ! npx supabase@2.30.4 projects list &>/dev/null; then
  echo "Log in first: npx supabase@2.30.4 login"
  exit 1
fi

npx supabase@2.30.4 secrets set "OPENAI_API_KEY=${OPENAI_API_KEY}" --project-ref "${PROJECT_REF}"
echo "Done. Redeploy if needed: npx supabase@2.30.4 functions deploy analyze-frame --project-ref ${PROJECT_REF}"
