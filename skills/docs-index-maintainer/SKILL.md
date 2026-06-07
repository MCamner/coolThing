---
name: docs-index-maintainer
description: Use when keeping coolThing README, docs index, sitemap, project cards, backend docs, tool docs, changelog, roadmap, or GitHub Pages metadata consistent with code.
---

# Docs Index Maintainer

Use this skill when user-facing project surfaces change.

## When to use

- Keeping README, docs index, sitemap, or GitHub Pages metadata consistent with code
- Adding or updating project cards, experiment links, or changelog entries
- Syncing backend or tool docs after behavioral changes

## When not to use

- Frontend UI changes — use `retro-frontend-maintainer`
- Backend API changes — use `backend-music-tools-maintainer`
- Release validation — use `release-readiness`

## Docs And Index Surfaces

- `README.md`
- `docs/index.html`
- `docs/sitemap.xml`
- `docs/robots.txt`
- `backend/README.md`
- `tools/README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `VERSION`
- `skills/local-dev-server-maintainer/SKILL.md` for port and startup docs

## Synchronization Rules

When adding or changing an experiment:

- Add or update the app under `docs/<name>/`.
- Link it from `docs/index.html`.
- Add or update README Projects section.
- Add route to `docs/sitemap.xml`.
- Update backend docs if it uses `backend/app.py`.
- Update local server/port docs if startup or URLs change.
- Add smoke docs or script if API behavior matters.
- Update changelog for release-facing changes.

## Metadata Rules

Public pages should include:

- title
- description
- canonical URL when page is intended for indexing
- favicon
- social preview metadata for major pages
- mobile viewport

## Verification

```bash
rg "mega-guitar|prompt-image|mega-now" README.md docs/index.html docs/sitemap.xml
```

For local site:

```bash
cd docs
python3 -m http.server 3000 --bind 127.0.0.1
```

Check home and any changed app path.

## Review Standard

Lead with missing index links, stale README project descriptions, sitemap drift,
wrong local URLs, and backend docs that do not match the API.
