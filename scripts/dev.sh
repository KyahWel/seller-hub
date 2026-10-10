#!/usr/bin/env bash
# Runs Seller Hub locally.
#
#   scripts/dev.sh        web + gateway + all four services
#   scripts/dev.sh api    gateway + services only
#   scripts/dev.sh web    web only (expects the API on :3000)
#
# Ctrl+C stops everything.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

mode="${1:-all}"
case "$mode" in
  all) script=dev ports=(4200 3000 3001 3002 3003 3004) ;;
  api) script=start:api ports=(3000 3001 3002 3003 3004) ;;
  web) script=start:web ports=(4200) ;;
  -h | --help)
    sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  *) die "Unknown mode '$mode'. Use: all, api or web." ;;
esac

require_node
ensure_deps

if [[ ! -f .env ]]; then
  info "Creating .env from .env.example"
  cp .env.example .env
fi

# Fail early instead of letting one app crash on EADDRINUSE among six logs.
busy=''
for port in "${ports[@]}"; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    busy="$busy $port"
  fi
done
if [[ -n "$busy" ]]; then
  die "Port(s)$busy already in use. See what holds them with: lsof -nP -iTCP -sTCP:LISTEN"
fi

[[ "$mode" != api ]] && info "Web:     http://localhost:4200"
[[ "$mode" != web ]] && info "Gateway: http://localhost:3000/api/health"
exec npm run "$script"
