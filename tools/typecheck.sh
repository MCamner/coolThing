#!/usr/bin/env bash
set -euo pipefail

# Type-check backend and tests. Locally this uses backend/.venv, the same
# environment the VS Code mypy extension sees. In CI (no venv) it uses
# $PYTHON or python3 on PATH. Settings live in mypy.ini.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_PYTHON="$ROOT_DIR/backend/.venv/bin/python"

if [[ ! -x "$TARGET_PYTHON" ]]; then
  TARGET_PYTHON="$(command -v "${PYTHON:-python3}")"
fi

if "$TARGET_PYTHON" -m mypy --version >/dev/null 2>&1; then
  MYPY=("$TARGET_PYTHON" -m mypy)
elif command -v mypy >/dev/null 2>&1; then
  MYPY=(mypy)
else
  echo "mypy not found (brew install mypy, or pip install mypy)" >&2
  exit 1
fi

cd "$ROOT_DIR"
"${MYPY[@]}" --python-executable "$TARGET_PYTHON" backend/app.py tests/
