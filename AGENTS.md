# coolThing — agent instructions

Retro browser experiments (`docs/`, GitHub Pages) and a local FastAPI backend
(`backend/app.py`, port 8001) for music tools and PromptImage.

## Skills

Repo skills live in `skills/<name>/SKILL.md`. [SKILLS.md](SKILLS.md) is the
index with ownership and when/when-not-to-use boundaries.

Both agents discover the same files through symlinks:

- Claude Code: `.claude/skills -> ../skills`
- Codex: `.agents/skills -> ../skills`

Edit skills only under `skills/`. Add new skills to the index in `SKILLS.md`.

## Local run

```bash
cd backend && .venv/bin/uvicorn app:app --port 8001
cd docs && python3 -m http.server 3000 --bind 127.0.0.1
```
