#!/usr/bin/env bash
# Runs every check CI runs, plus dependency health, and prints a summary.
#
#   scripts/check.sh            everything: deps, format, lint, test, build, typecheck, e2e
#   scripts/check.sh --quick    only projects changed vs main, no e2e
#   scripts/check.sh --fix      format the code first instead of only checking it
#
# Options can be combined. Exits non-zero if any blocking check fails.
set -uo pipefail
source "$(dirname "$0")/lib.sh"

quick=false fix=false
for arg in "$@"; do
  case "$arg" in
    --quick) quick=true ;;
    --fix) fix=true ;;
    -h | --help)
      sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) die "Unknown option '$arg'. See --help." ;;
  esac
done

require_node
ensure_deps
export NX_NO_CLOUD=true

results=()
failed=0

# step <name> <command...>: a blocking check.
step() {
  local name="$1"
  shift
  echo
  info "$name"
  local start=$SECONDS
  if "$@"; then
    results+=("${GREEN}pass${RESET}  $name ${DIM}($((SECONDS - start))s)${RESET}")
  else
    results+=("${RED}FAIL${RESET}  $name ${DIM}($((SECONDS - start))s)${RESET}")
    failed=1
  fi
}

# report <name> <command...>: informational, never fails the run.
report() {
  local name="$1"
  shift
  echo
  info "$name"
  "$@" || true
  results+=("${DIM}info${RESET}  $name")
}

audit_summary() {
  npm audit --json 2>/dev/null | node -e '
    const m = JSON.parse(require("fs").readFileSync(0, "utf8")).metadata?.vulnerabilities ?? {};
    console.log(`all dependencies: ${m.total ?? 0} (critical ${m.critical ?? 0}, high ${m.high ?? 0}, moderate ${m.moderate ?? 0}, low ${m.low ?? 0})`);
    console.log("Production deps are checked above; the rest only affect local tooling. See \x27npm audit\x27.");
  '
}

outdated_summary() {
  npm outdated --json 2>/dev/null | node -e '
    const raw = require("fs").readFileSync(0, "utf8").trim();
    const data = raw ? JSON.parse(raw) : {};
    const rows = Object.entries(data).map(([name, v]) => {
      const e = Array.isArray(v) ? v[0] : v;
      const major = e.current && e.latest && e.current.split(".")[0] !== e.latest.split(".")[0];
      return [name, e.current ?? "-", e.wanted, e.latest, major ? "major" : ""];
    });
    if (!rows.length) {
      console.log("Everything is up to date.");
    } else {
      const w = [0, 1, 2, 3].map((i) => Math.max(...rows.map((r) => r[i].length), 7));
      for (const r of [["package", "current", "wanted", "latest", ""], ...rows])
        console.log(r.slice(0, 4).map((c, i) => c.padEnd(w[i])).join("  "), r[4]);
    }
  '
}

# Dependencies
step "Dependency tree is consistent (npm ls)" npm ls --depth=0
step "No high/critical advisories in production deps" npm audit --omit=dev --audit-level=high
report "Advisories in all dependencies" audit_summary
report "Outdated packages (update via Dependabot or 'npx nx migrate')" outdated_summary

# Code
if $fix; then
  step "Format (write)" npx nx format:write
else
  step "Format" npx nx format:check
fi

if $quick; then
  step "Lint, test, build, typecheck (affected vs main)" \
    npx nx affected -t lint test build typecheck --base=main
else
  step "Lint, test, build, typecheck (all projects)" \
    npx nx run-many -t lint test build typecheck
  step "Install the Playwright browser" npx playwright install chromium
  step "E2E (web against the mock API)" npx nx run-many -t e2e
fi

echo
echo "${BOLD}Summary${RESET}"
printf '  %s\n' "${results[@]}"
echo
if ((failed)); then
  echo "${RED}Some checks failed.${RESET}"
  exit 1
fi
echo "${GREEN}All checks passed.${RESET}"
