---
name: local-dev-server-maintainer
description: Use when starting, debugging, documenting, or changing coolThing local dev servers, ports, backend/frontend URLs, CORS, health checks, or localhost workflows.
---

# Local Dev Server Maintainer

Use this skill whenever coolThing work depends on local servers, ports, URLs, or
backend/frontend coordination.

## Port Contract

Default local services:

- Frontend: `http://127.0.0.1:3000` or `http://localhost:3000`
- Backend: `http://127.0.0.1:8001`
- Backend health: `http://127.0.0.1:8001/`

Important app URLs:

- Home: `http://localhost:3000/`
- PromptImage: `http://localhost:3000/prompt-image/`
- Mega Guitar: `http://localhost:3000/mega-guitar/`
- Mega Now: `http://localhost:3000/mega-now/`
- Mega Movie: `http://localhost:3000/mega-movie/`
- Mega Tuner: `http://localhost:3000/mega-tuner/`
- Mega Setlist: `http://localhost:3000/mega-setlist/`

## Startup Commands

Start everything:

```bash
./tools/start.sh
```

Start backend only:

```bash
./tools/run-mega-guitar-backend.sh
```

Start frontend only:

```bash
./tools/serve-frontend.sh
```

Manual frontend fallback:

```bash
cd docs
python3 -m http.server 3000 --bind 127.0.0.1
```

## Backend-Required Apps

These need the local backend for their main workflow:

- PromptImage: `POST /prompt-image`
- Mega Guitar: `POST /generate`, `POST /chords`, `POST /lyrics`
- Mega Now: Spotify OAuth, now-playing, YouTube handoff

The GitHub Pages version can load the frontend, but local backend-powered
features need `backend/app.py` running on port `8001`.

## Port Checks

Before starting servers, check conflicts when needed:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:8001 -sTCP:LISTEN
```

If a stale process owns a port, identify it before killing it:

```bash
ps -p <PID> -o pid,ppid,command
```

Only stop processes that clearly belong to coolThing or a previous local dev
session.

## CORS Contract

Backend CORS in `backend/app.py` should include the local frontend origins:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

Do not broaden CORS to arbitrary origins unless the user explicitly asks and the
safety impact is documented.

## Verification

Fast checks:

```bash
PYTHONPYCACHEPREFIX=/tmp/coolthing-pycache python3 -m py_compile backend/app.py
./tools/smoke-prompt-image.sh
```

Runtime checks:

```bash
curl http://127.0.0.1:8001/
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/prompt-image/
```

Browser checks:

- frontend loads
- backend health is reachable
- app shows clear offline/backend-missing state when backend is stopped
- app succeeds or fails with useful errors when backend is running

## Documentation Rules

When changing ports or startup scripts, update:

- `README.md`
- `backend/README.md`
- `tools/README.md`
- any affected frontend notices
- CORS settings in `backend/app.py`

## Review Standard

Lead with wrong ports, missing health checks, stale local URLs, CORS drift,
unclear backend-required messaging, and unsafe process-kill advice.
