#!/usr/bin/env bash
# Lighthouse mobile audit against `vite preview` (plan Appendix H, budgets §3.4).
#
#   npm run qa:lighthouse            # starts vite preview itself
#   URL=https://example.com npm run qa:lighthouse
#
# Thresholds: performance >= 90, accessibility 100, best-practices >= 95.
# SEO: 100 on the canonical target. On a preview build the page is noindex by
# design (decision D5), so `is-crawlable` scores 0 and the category caps at 66 —
# there, require every SEO audit *except* `is-crawlable` to pass instead.
set -euo pipefail

cd "$(dirname "$0")/.."

PORT=4173
BASE_PATH="${BASE_PATH:-/}"
OUT="docs/qa/lighthouse.json"
PREVIEW_PID=""

cleanup() {
  if [ -n "$PREVIEW_PID" ]; then kill "$PREVIEW_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

if [ -z "${URL:-}" ]; then
  if [ ! -f dist/index.html ]; then
    echo "dist/ is missing - run 'npm run build' first (or set URL)." >&2
    exit 1
  fi
  # Never audit a server this script did not start (QA-4): --strictPort makes
  # vite exit when 4173 is taken, and the wait loop below would then happily
  # succeed against whatever foreign process is holding it.
  if curl -s -o /dev/null --max-time 2 "http://localhost:${PORT}/"; then
    echo "port ${PORT} is already in use - stop that server and re-run." >&2
    exit 1
  fi
  # Run vite's bin directly so $! is vite itself (killing an `npx` wrapper
  # leaves the real server orphaned on Linux).
  node node_modules/vite/bin/vite.js preview --port "$PORT" --strictPort >/dev/null &
  PREVIEW_PID=$!
  URL="http://localhost:${PORT}${BASE_PATH}"
  for _ in $(seq 1 60); do
    if ! kill -0 "$PREVIEW_PID" 2>/dev/null; then
      echo "vite preview exited before it answered on ${PORT}." >&2
      exit 1
    fi
    if curl -fsS -o /dev/null "$URL" 2>/dev/null; then break; fi
    sleep 0.5
  done
fi

mkdir -p docs/qa
echo "lighthouse: $URL"
# Lighthouse 13 has no "mobile" preset - mobile is the default form factor and
# the only presets are perf/experimental/desktop. State it explicitly instead.
npx lighthouse "$URL" \
  --form-factor=mobile \
  --screenEmulation.mobile \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path="$OUT" \
  --chrome-flags="--headless=new" \
  --quiet

node -e '
const fs = require("node:fs");
const report = JSON.parse(fs.readFileSync("docs/qa/lighthouse.json", "utf8"));
const canonical = fs.existsSync("public/CNAME");
const thresholds = {
  performance: 90,
  accessibility: 100,
  "best-practices": 95,
  ...(canonical ? { seo: 100 } : {}),
};
let failed = 0;
for (const [key, min] of Object.entries(thresholds)) {
  const score = Math.round((report.categories[key].score ?? 0) * 100);
  const ok = score >= min;
  if (!ok) failed += 1;
  console.log(`  ${ok ? "ok" : "x "} ${key.padEnd(15)} ${String(score).padStart(3)} (min ${min})`);
}
if (!canonical) {
  const offenders = report.categories.seo.auditRefs
    .filter((ref) => ref.id !== "is-crawlable")
    .filter((ref) => (report.audits[ref.id].score ?? 1) < 1)
    .map((ref) => ref.id);
  const ok = offenders.length === 0;
  if (!ok) failed += 1;
  console.log(
    `  ${ok ? "ok" : "x "} ${"seo (preview)".padEnd(15)} ` +
      (ok ? "all audits pass except is-crawlable (noindex by design, D5)" : offenders.join(", ")),
  );
}
if (failed > 0) {
  console.error(`\nFAIL: ${failed} category(ies) below budget.`);
  process.exit(1);
}
console.log("\nOK: all Lighthouse budgets met.");
'
