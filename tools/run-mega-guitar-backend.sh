#!/usr/bin/env bash

# ============================================
# run-mega-guitar-backend.sh
# Start local FastAPI backend for Mega Guitar
#
# Author: Mattias Camner
# ============================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "== Mega Guitar Backend =="
echo "Repo:    $ROOT_DIR"
echo "Backend: $BACKEND_DIR"
echo

if [ ! -d "$BACKEND_DIR" ]; then
  echo "ERROR: backend directory not found."
  exit 1
fi

if [ ! -f "$BACKEND_DIR/app.py" ]; then
  echo "ERROR: backend/app.py not found."
  exit 1
fi

if [ ! -f "$BACKEND_DIR/requirements.txt" ]; then
  echo "ERROR: backend/requirements.txt not found."
  exit 1
fi

cd "$BACKEND_DIR"

if [ -f ".env" ]; then
  echo "Loading .env..."
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
elif [ -f "$ROOT_DIR/.env" ]; then
  echo "Loading root .env..."
  set -a
  # shellcheck source=/dev/null
  source "$ROOT_DIR/.env"
  set +a
else
  echo "WARNING: no .env found — SPOTIFY_CLIENT_ID/SECRET must be set in environment"
fi

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate

REQUIREMENTS_HASH="$(shasum -a 256 requirements.txt | awk '{print $1}')"
REQUIREMENTS_STAMP=".venv/.requirements.sha256"
if [[ ! -f "$REQUIREMENTS_STAMP" ]] || [[ "$(cat "$REQUIREMENTS_STAMP")" != "$REQUIREMENTS_HASH" ]]; then
  echo "Installing requirements..."
  pip install -r requirements.txt
  printf '%s\n' "$REQUIREMENTS_HASH" > "$REQUIREMENTS_STAMP"
else
  echo "Requirements unchanged; skipping install."
fi

echo
echo "Starting backend:"
echo "http://127.0.0.1:8001"
echo
echo "Press Ctrl+C to stop."
echo

uvicorn app:app --reload --port 8001
