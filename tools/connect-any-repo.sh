#!/usr/bin/env bash

# ============================================
# connect-any-repo.sh
# Connect any local folder to any GitHub repo
#
# Author: Mattias Camner
# ============================================

set -e

echo "== Connect any local folder to any GitHub repo =="
echo

read -r -p "GitHub repo URL: " REPO_URL
read -r -p "Local folder path [current folder]: " TARGET_DIR
read -r -p "Branch [main]: " BRANCH

TARGET_DIR="${TARGET_DIR:-$(pwd)}"
BRANCH="${BRANCH:-main}"

if [ -z "$REPO_URL" ]; then
  echo "ERROR: GitHub repo URL is required."
  exit 1
fi

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

echo
echo "Folder: $(pwd)"
echo "Repo:   $REPO_URL"
echo "Branch: $BRANCH"
echo

if [ ! -d ".git" ]; then
  git init
fi

git branch -M "$BRANCH"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git fetch origin "$BRANCH" || true

if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git pull origin "$BRANCH" --allow-unrelated-histories --no-rebase || true
fi

git add .

if git diff --cached --quiet; then
  echo "No local changes to commit."
else
  git commit -m "Connect local folder to GitHub repo"
fi

git push -u origin "$BRANCH"

echo
echo "Done."
git remote -v
