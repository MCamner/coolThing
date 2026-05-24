#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_FILE="$ROOT_DIR/docs/prompt-image/index.html"
BACKEND_FILE="$ROOT_DIR/backend/app.py"

check_contains() {
  local file="$1"
  local pattern="$2"
  local label="$3"

  if grep -Fq "$pattern" "$file"; then
    echo "ok: $label"
  else
    echo "missing: $label" >&2
    echo "file: $file" >&2
    exit 1
  fi
}

echo "== PromptImage smoke =="

test -f "$FRONTEND_FILE"
test -f "$BACKEND_FILE"

check_contains "$FRONTEND_FILE" 'value="photo90s">1990s Photo' "frontend 1990s Photo option"
check_contains "$FRONTEND_FILE" 'value="photo80s">1980s Photo' "frontend 1980s Photo option"
check_contains "$FRONTEND_FILE" 'value="pulp">Vintage Pulp Art' "frontend Vintage Pulp Art option"
check_contains "$BACKEND_FILE" '"photo90s":' "backend photo90s style"
check_contains "$BACKEND_FILE" '"photo80s":' "backend photo80s style"
check_contains "$BACKEND_FILE" '"pulp":' "backend pulp style"

PYTHONPYCACHEPREFIX="${PYTHONPYCACHEPREFIX:-/tmp/coolthing-pycache}" python3 -m py_compile "$BACKEND_FILE"

echo "PromptImage smoke passed."
