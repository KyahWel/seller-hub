# Shared helpers for scripts/*.sh. Source it; don't run it.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -t 1 ]]; then
  BOLD=$'\e[1m' DIM=$'\e[2m' RED=$'\e[31m' GREEN=$'\e[32m' YELLOW=$'\e[33m' RESET=$'\e[0m'
else
  BOLD='' DIM='' RED='' GREEN='' YELLOW='' RESET=''
fi

info() { echo "${BOLD}==>${RESET} $*"; }
warn() { echo "${YELLOW}warning:${RESET} $*" >&2; }
die() {
  echo "${RED}error:${RESET} $*" >&2
  exit 1
}

# Node must match .nvmrc's major version (engines: >=24).
require_node() {
  command -v node >/dev/null || die "Node.js is not installed. Install Node $(cat .nvmrc) (e.g. 'nvm install')."
  local want have
  want="$(tr -d 'v \n' <.nvmrc)"
  have="$(node -p 'process.versions.node.split(".")[0]')"
  ((have >= want)) || die "Node $want+ is required, found $(node -v). Run 'nvm use'."
}

# Installs dependencies when node_modules is missing or older than the lockfile.
ensure_deps() {
  if [[ ! -f node_modules/.package-lock.json || package-lock.json -nt node_modules/.package-lock.json ]]; then
    info "Installing dependencies (npm install)"
    npm install
  fi
}
