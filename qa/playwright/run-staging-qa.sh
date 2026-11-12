#!/usr/bin/env bash
# Staging-only browser QA runner for a GitHub Codespace or other network-enabled Linux machine.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/qa/playwright"
export QA_BASE_URL="https://leasewild-sandbox.pages.dev"
export CI=1
umask 077
mkdir -p artifacts
if ! command -v node >/dev/null; then echo "BLOCKED: Node.js 22+ is required" >&2; exit 2; fi
if ! curl --fail --silent --show-error --max-time 20 --output /dev/null "$QA_BASE_URL"; then
  echo "BLOCKED: cannot reach sandbox from this runner; no browser PASS is established" >&2
  exit 3
fi
npm install --no-audit --no-fund
npx playwright install --with-deps chromium webkit
set +e
npx playwright test "$@"
status=$?
set -e
echo "Browser test exit code: $status"
echo "Evidence: qa/playwright/artifacts/ (HTML, JSON, JUnit, screenshots, traces and video for non-payment projects)"
echo "Skipped cases and absent synthetic fixtures are NOT passes. Reconcile Stripe TEST against sandbox DB separately."
exit "$status"
