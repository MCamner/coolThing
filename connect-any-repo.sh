cat > connect-any-repo.sh <<'EOF'
#!/usr/bin/env bash
set -e

REPO_URL="$1"
TARGET_DIR="${2:-$(pwd)}"
BRANCH="${3:-main}"

if [ -z "$REPO_URL" ]; then
  echo "Usage:"
  echo "  ./connect-any-repo.sh <repo-url> [target-dir] [branch]"
  echo
  echo "Example:"
  echo "  ./connect-any-repo.sh https://github.com/MCamner/coolThing.git . main"
  exit 1
fi

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

echo "== Connect folder to GitHub repo =="
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
EOF

chmod +x connect-any-repo.sh
