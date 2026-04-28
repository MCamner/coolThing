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

cd "$BACKEND_DIR"

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate

echo "Installing requirements..."
pip install -r requirements.txt

echo
echo "Starting backend on http://127.0.0.1:8000"
echo "Press Ctrl+C to stop."
echo

uvicorn app:app --reload --port 8000
