# Mega Guitar Backend

Local FastAPI backend for the Mega Guitar mini-app.

This backend currently returns mock guitar tab data. It is designed so the frontend can be tested before adding real audio transcription.

---

## Purpose

The backend provides an API endpoint:

    POST /generate

The frontend sends a YouTube URL, and the backend returns tab data as JSON.

Current mode:

    mock

Future mode:

    audio transcription with Basic Pitch / MIDI / tab mapping

---

## Structure

    backend/
    ├── app.py
    ├── requirements.txt
    ├── .gitignore
    └── README.md

---

## Setup

From repo root:

    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

---

## Run server

    uvicorn app:app --reload --port 8000

Backend URL:

    http://127.0.0.1:8000

Health check:

    http://127.0.0.1:8000/

---

## Test API

Open a new terminal while the server is running:

    curl -X POST http://127.0.0.1:8000/generate \
      -H "Content-Type: application/json" \
      -d '{"youtube_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

Expected response includes:

    {
      "status": "ok",
      "mode": "mock",
      "tab": "..."
    }

---

## Frontend integration

The GitHub Pages frontend lives here:

    docs/mega-guitar/

Frontend URL:

    https://mcamner.github.io/coolThing/mega-guitar/

Local backend endpoint used by the frontend:

    http://127.0.0.1:8000/generate

---

## Notes

GitHub Pages can host the frontend, but it cannot run Python, FFmpeg, or AI transcription models.

For real transcription, this backend will later need:

- audio extraction
- FFmpeg
- Basic Pitch or similar transcription model
- MIDI/note output
- guitar tab mapping logic

---

## Development flow

1. Start backend locally
2. Open Mega Guitar frontend
3. Click Load demo
4. Click Generate Tabs
5. Confirm backend receives POST /generate
6. Render returned tab data in browser
