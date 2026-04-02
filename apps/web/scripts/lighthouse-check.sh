#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${LIGHTHOUSE_PORT:-3100}"
TARGET_URL="${LIGHTHOUSE_URL:-http://127.0.0.1:${PORT}}"
REPORT_DIR="${LIGHTHOUSE_REPORT_DIR:-.lighthouse}"
REPORT_JSON="${REPORT_DIR}/lighthouse-report.json"

CHROME_PATH="${LIGHTHOUSE_CHROME_PATH:-}"
if [[ -z "$CHROME_PATH" ]]; then
  if command -v chromium >/dev/null 2>&1; then
    CHROME_PATH="$(command -v chromium)"
  elif [[ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  elif [[ -x "/Applications/Chromium.app/Contents/MacOS/Chromium" ]]; then
    CHROME_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
  else
    echo "[lighthouse] Chrome/Chromium executable not found." >&2
    exit 1
  fi
fi

mkdir -p "$REPORT_DIR"

if [[ ! -d ".next" ]]; then
  npm run build
fi

SERVER_LOG="${REPORT_DIR}/next-start.log"
npm run start -- --port "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  if curl -fsS "$TARGET_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "$TARGET_URL" >/dev/null 2>&1; then
  echo "[lighthouse] Failed to start local server at $TARGET_URL" >&2
  echo "[lighthouse] Check log: $SERVER_LOG" >&2
  exit 1
fi

npx --yes lighthouse "$TARGET_URL" \
  --quiet \
  --chrome-path "$CHROME_PATH" \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path "$REPORT_JSON"

node -e "const fs=require('fs');const p=process.argv[1];const r=JSON.parse(fs.readFileSync(p,'utf8'));const c=r.categories;const s=(k)=>Math.round((c[k]?.score??0)*100);console.log('[lighthouse] performance='+s('performance')+' accessibility='+s('accessibility')+' best-practices='+s('best-practices')+' seo='+s('seo'));" "$REPORT_JSON"

echo "[lighthouse] report=$REPORT_JSON"
