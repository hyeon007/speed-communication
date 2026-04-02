#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE=".env"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f ".env.production.example" ]]; then
    cp ".env.production.example" "$ENV_FILE"
    echo "[rehearsal] .env not found. Created from .env.production.example"
  else
    echo "[rehearsal] Missing .env and .env.production.example" >&2
    exit 1
  fi
fi

set -a
source "$ENV_FILE"
set +a

if [[ "${LEAD_STORAGE:-}" != "prisma" ]]; then
  echo "[rehearsal] LEAD_STORAGE must be 'prisma' for production-like migration rehearsal." >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[rehearsal] DATABASE_URL is required." >&2
  exit 1
fi

echo "[rehearsal] DATABASE_URL target: ${DATABASE_URL}"
echo "[rehearsal] Running prisma:generate"
npm run prisma:generate

echo "[rehearsal] Running prisma:validate"
npm run prisma:validate

echo "[rehearsal] Running prisma:migrate:status (pre-check)"
set +e
npm run prisma:migrate:status
STATUS_EXIT=$?
set -e
if [[ "$STATUS_EXIT" -ne 0 ]]; then
  echo "[rehearsal] pre-check status returned non-zero (pending migrations expected)."
fi

echo "[rehearsal] Running prisma:migrate:deploy"
npm run prisma:migrate:deploy

echo "[rehearsal] Running prisma:migrate:status (post-check)"
npm run prisma:migrate:status

if command -v psql >/dev/null 2>&1; then
  echo "[rehearsal] Verifying _prisma_migrations table"
  PSQL_URL="${DATABASE_URL%%\?*}"
  psql "$PSQL_URL" -c "SELECT migration_name, finished_at IS NOT NULL AS applied FROM _prisma_migrations ORDER BY migration_name;"
else
  echo "[rehearsal] psql not found; skipped direct _prisma_migrations query"
fi

echo "[rehearsal] Completed successfully"
