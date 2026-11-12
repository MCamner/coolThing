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

# Every skill: SKILL.md name matches its folder, it is indexed in SKILLS.md,
# and it has evals/evals.json with a matching skill_name.
python3 - "$ROOT_DIR" <<'PY'
import json
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
index = (root / "SKILLS.md").read_text()
errors = []
for skill_dir in sorted(p for p in (root / "skills").iterdir() if p.is_dir()):
    name = skill_dir.name
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.is_file():
        errors.append(f"{name}: missing SKILL.md")
        continue
    match = re.search(r"^name:\s*(\S+)", skill_md.read_text(), re.MULTILINE)
    if not match or match.group(1) != name:
        errors.append(f"{name}: SKILL.md name does not match folder")
    if f"(skills/{name}/SKILL.md)" not in index:
        errors.append(f"{name}: not listed in SKILLS.md")
    evals_path = skill_dir / "evals" / "evals.json"
    if not evals_path.is_file():
        errors.append(f"{name}: missing evals/evals.json")
        continue
    try:
        evals = json.loads(evals_path.read_text())
    except json.JSONDecodeError as exc:
        errors.append(f"{name}: invalid evals.json ({exc})")
        continue
    if evals.get("skill_name") != name or not evals.get("evals"):
        errors.append(f"{name}: evals.json skill_name mismatch or no evals")
for line in errors:
    print(f"skill contract: {line}", file=sys.stderr)
sys.exit(1 if errors else 0)
PY

echo "Documentation contracts: PASS"
