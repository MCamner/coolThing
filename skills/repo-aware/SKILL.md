---
name: repo-aware
description: Use when inspecting, explaining, planning, reviewing, or changing coolThing with repository-specific context.
---

# Repo Aware

Use this skill to keep work grounded in coolThing's actual static frontend,
local backend, retro web experiments, and release flow.

## What This Repo Is

coolThing is a collection of retro browser experiments, local music tools, and
small repo utilities. The public site is served from `docs/` via GitHub Pages.
The local backend is a FastAPI service under `backend/`.

Primary surfaces:

- `docs/index.html` for the archive/home page
- `docs/prompt-image/index.html` for PromptImage
- `docs/mega-guitar/` for the MTV-style guitar tab UI
- `docs/mega-now/index.html` for Spotify now-playing handoff
- `docs/mega-movie/`, `docs/mega-tuner/`, and `docs/mega-setlist/` for other
  browser experiments
- `backend/app.py` for FastAPI endpoints and local AI/music integrations
- `tools/start.sh`, `tools/serve-frontend.sh`, and
  `tools/run-mega-guitar-backend.sh` for local workflows
- `tools/smoke-prompt-image.sh` for PromptImage regression checks
- `release.sh`, `VERSION`, `CHANGELOG.md`, and `ROADMAP.md` for releases

## First Inspection

Start with:

```bash
git status --short
rg --files
sed -n '1,240p' README.md
sed -n '1,260p' backend/app.py
sed -n '1,220p' docs/index.html
```

For frontend work, inspect the specific app directory plus `docs/index.html`.
For backend work, inspect `backend/app.py`, `backend/requirements.txt`, and the
matching frontend caller.

## Verification

Use the lightest relevant checks:

```bash
PYTHONPYCACHEPREFIX=/tmp/coolthing-pycache python3 -m py_compile backend/app.py
./tools/smoke-prompt-image.sh
```

For local manual review:

```bash
./tools/start.sh
```

Or run pieces separately:

```bash
./tools/run-mega-guitar-backend.sh
./tools/serve-frontend.sh
```

## Guardrails

- Preserve the retro/local-tools identity.
- Do not add a frontend framework unless explicitly requested.
- Keep local credentials in `.env`, never in committed files.
- Keep backend ports local by default.
- Update README, docs index, sitemap, and smoke checks when adding a public
  experiment.
- Prefer small, testable changes over broad rewrites.
