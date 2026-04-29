#!/usr/bin/env bash

# ============================================
# start.sh
# Start backend + frontend in one command
#
# Author: Mattias Camner
# ============================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  echo
  echo "Stopping..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo "Done."
}
trap cleanup INT TERM

echo "== coolThing =="
echo
echo "Starting backend and frontend..."
echo

# Backend
cd "$ROOT_DIR/backend"

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt --quiet

uvicorn app:app --reload --port 8000 &
BACKEND_PID=$!

# Frontend
cd "$ROOT_DIR/docs"
python3 -m http.server 3000 --bind 127.0.0.1 &
FRONTEND_PID=$!

sleep 1

echo
echo "Backend:        http://127.0.0.1:8000"
echo "Mega Guitar:    http://localhost:3000/mega-guitar/"
echo "Mega Now:       http://localhost:3000/mega-now/"
echo "Mega Movie:     http://localhost:3000/mega-movie/"
echo
echo "Press Ctrl+C to stop."
echo

wait "$BACKEND_PID" "$FRONTEND_PID"
