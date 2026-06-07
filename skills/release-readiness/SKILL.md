---
name: release-readiness
description: Use when preparing coolThing for release by checking Git state, versioning, changelog, README badge, backend syntax, smoke scripts, docs index, sitemap, and GitHub Pages readiness.
---

# Release Readiness

Use this skill before tagging, pushing a release, or announcing a new coolThing
experiment.

## When to use

- Before tagging, pushing a release, or announcing a new experiment
- Verifying version alignment, changelog, and smoke readiness before a release

## When not to use

- Regular development or feature work
- Frontend or backend changes not bound for immediate release
- General docs — use `docs-index-maintainer`

## Evals

### Should trigger

* "is coolThing ready to release?"
* "run the coolThing release checklist"
* "what do I need to check before announcing the next coolThing update?"
* "verify version, changelog, and smoke scripts before tagging coolThing"

### Should not trigger

* "update the project README or experiment index" → use `docs-index-maintainer`
* "fix a backend API endpoint" → use `backend-music-tools-maintainer`
* "update the frontend" → use `retro-frontend-maintainer`
* "regular coolThing development work" → only needed at release boundaries

## Always Inspect

- `git status --short`
- `VERSION`
- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `release.sh`
- `docs/index.html`
- `docs/sitemap.xml`
- `backend/app.py`
- `tools/*.sh`
- `skills/local-dev-server-maintainer/SKILL.md`

## Blockers

- dirty worktree with unrelated changes
- version mismatch between `VERSION`, README badge, and changelog
- backend syntax failure
- local server docs disagree with `tools/start.sh` or `backend/app.py`
- PromptImage smoke failure after prompt-image changes
- new public app missing from `docs/index.html`
- new public app missing from `docs/sitemap.xml`
- secrets or `.env` staged
- release script dry-run failure

## Verification

```bash
PYTHONPYCACHEPREFIX=/tmp/coolthing-pycache python3 -m py_compile backend/app.py
./tools/smoke-prompt-image.sh
./release.sh --dry-run <version>
```

For frontend-only changes:

```bash
cd docs
python3 -m http.server 3000 --bind 127.0.0.1
```

## Report Format

Return:

- status: ready, blocked, or uncertain
- checks run
- files changed
- docs/index surfaces checked
- anything not verified because it requires credentials, network, or heavy audio
  processing
