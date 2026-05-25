---
name: backend-music-tools-maintainer
description: Use when changing coolThing FastAPI backend, Mega Guitar, Mega Now, YouTube audio download, Basic Pitch, chord detection, lyrics transcription, Spotify OAuth, or local API behavior.
---

# Backend Music Tools Maintainer

Use this skill for `backend/app.py` and the local music/API features.

## Core Files

- `backend/app.py`
- `backend/requirements.txt`
- `backend/README.md`
- `docs/mega-guitar/app.js`
- `docs/mega-guitar/index.html`
- `docs/mega-now/index.html`
- `tools/run-mega-guitar-backend.sh`
- `tools/start.sh`
- `skills/local-dev-server-maintainer/SKILL.md`

## API Surfaces

- `GET /` health check
- `POST /generate` for YouTube to tab generation
- `POST /chords` for chord detection
- `POST /lyrics` for faster-whisper lyrics transcription
- Spotify OAuth and `GET /spotify/now-playing`
- `GET /spotify/youtube-search`
- `POST /prompt-image` shares the same backend

## Safety And Runtime Rules

- Keep backend local-first and bind local ports in scripts.
- Default backend URL is `http://127.0.0.1:8001`.
- Keep frontend callers aligned with the port contract in
  `local-dev-server-maintainer`.
- Do not log secrets or OAuth tokens.
- Keep Spotify credentials in environment variables.
- Treat YouTube/audio processing as potentially slow and failure-prone; return
  clear HTTP errors.
- Use temporary directories for downloads and generated audio.
- Avoid expanding CORS broadly beyond known local/GitHub Pages origins.
- Keep dependency-heavy work behind explicit user action.

## Change Workflow

When changing an endpoint:

1. Update backend function.
2. Update matching frontend caller.
3. Update README/backend docs if the API shape changes.
4. Add or update smoke checks when possible.
5. Compile backend.

## Verification

```bash
PYTHONPYCACHEPREFIX=/tmp/coolthing-pycache python3 -m py_compile backend/app.py
./tools/run-mega-guitar-backend.sh
```

If a port may already be in use:

```bash
lsof -nP -iTCP:8001 -sTCP:LISTEN
```

Manual endpoint checks:

```bash
curl http://127.0.0.1:8001/
curl -X POST http://127.0.0.1:8001/chords \
  -H 'Content-Type: application/json' \
  -d '{"youtube_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Do not run expensive download/transcription checks unless the task requires it.

## Review Standard

Lead with broken API contracts, missing frontend updates, secret handling,
unbounded network/download behavior, and unclear user-facing errors.
