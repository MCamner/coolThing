#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

require_path() {
  local relative_path="$1"
  if [[ ! -e "$ROOT_DIR/$relative_path" ]]; then
    echo "missing documented path: $relative_path" >&2
    return 1
  fi
}

require_path "CONTRIBUTING.md"
require_path "docs/assets/social-preview.png"

grep -Fq '"youtube_url"' "$ROOT_DIR/README.md" || {
  echo "README lyrics example must use the youtube_url JSON contract" >&2
  exit 1
}

if grep -Fq 'docs/screenshots/main-demo.png' "$ROOT_DIR/README.md"; then
  echo "README references the missing main-demo screenshot" >&2
  exit 1
fi

echo "Documentation contracts: PASS"
