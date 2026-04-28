#!/usr/bin/env bash

# ============================================
# serve-frontend.sh
# Serve the docs/ folder on localhost:3000
#
# Author: Mattias Camner
# ============================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"
PORT=3000

echo "== Mega Guitar Frontend =="
echo "Serving: $DOCS_DIR"
echo "URL:     http://localhost:$PORT/mega-guitar/"
echo
echo "Press Ctrl+C to stop."
echo

cd "$DOCS_DIR"
python3 -m http.server $PORT
