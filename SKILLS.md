# coolThing Skills

This file is the skill index for coolThing. It keeps repo-local skills
discoverable and makes their responsibility boundaries explicit.

## Repo Responsibility

coolThing owns retro browser experiments, local music tools, PromptImage, the
FastAPI backend that powers local workflows, GitHub Pages docs under `docs/`,
and release/readiness notes for this repository.

This repo does not own MQ platform-wide orchestration, MCP runtime behavior,
HAL routing, UMS operations, or cross-repo release policy. Those belong in the
matching MQ repos and should only be referenced here when coolThing integrates
with them.

## Skill Index

| Skill | Status | Owner / Responsibility | Use When | Do Not Use When |
| --- | --- | --- | --- | --- |
| [`repo-aware`](skills/repo-aware/SKILL.md) | stable | General repo orientation and grounded planning | Inspecting, explaining, planning, reviewing, or changing coolThing with repo context | A narrower skill clearly owns the task |
| [`retro-frontend-maintainer`](skills/retro-frontend-maintainer/SKILL.md) | stable | Static frontend apps and retro UI consistency | Changing `docs/` browser experiments, CSS, JS interactions, project cards, or GitHub Pages pages | The change is backend/API-only |
| [`prompt-image-maintainer`](skills/prompt-image-maintainer/SKILL.md) | stable | PromptImage UI, backend endpoint, provider behavior, and smoke coverage | Changing `docs/prompt-image/`, `POST /prompt-image`, style/detail options, image upload UX, or prompt-generation tests | The image work is unrelated to PromptImage |
| [`backend-music-tools-maintainer`](skills/backend-music-tools-maintainer/SKILL.md) | stable | FastAPI backend and local music/API workflows | Changing Mega Guitar, Mega Now, YouTube audio download, Basic Pitch, chords, lyrics, Spotify OAuth, or local API behavior | The work only changes static page styling |
| [`local-dev-server-maintainer`](skills/local-dev-server-maintainer/SKILL.md) | stable | Local ports, startup scripts, backend/frontend URLs, CORS, and health checks | Starting, debugging, documenting, or changing localhost workflows | The task does not touch local runtime behavior |
| [`docs-index-maintainer`](skills/docs-index-maintainer/SKILL.md) | stable | README, docs index, sitemap, changelog, roadmap, and metadata consistency | Keeping user-facing docs and GitHub Pages metadata aligned with code | The task is private implementation only |
| [`release-readiness`](skills/release-readiness/SKILL.md) | stable | Release checks and publish readiness for coolThing | Checking Git state, version, changelog, README badge, smoke scripts, docs index, sitemap, and release script | The user only wants feature design or exploratory planning |

## Output Contract

Operational skill reports should prefer this shape when a structured result is
useful:

```text
status: ready | blocked | uncertain | informational
summary:
findings:
files inspected:
files changed:
checks run:
checks skipped:
risks:
next action:
```

Keep short answers short. Use the full contract for release checks, reviews,
and cross-surface changes where repeatable output matters.
