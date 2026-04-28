# Mega Guitar Backend

Local FastAPI backend for the Mega Guitar mini-app.

The backend currently returns mock guitar tab data. It exists so the frontend can be tested before adding real audio transcription.

---

## What it does

The backend exposes one main API endpoint:

    POST /generate

The frontend sends a YouTube URL and receives mock tab data as JSON.

Current mode:

    mock

Planned mode:

    audio transcription → MIDI/note data → guitar tab mapping

---

## Folder structure

    backend/
    ├── app.py
    ├── requirements.txt
    ├── .gitignore
    └── README.md

---

## Setup

From the repository root:

    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

---

## Run locally

Start the backend server:

    uvicorn app:app --reload --port 8000

Backend URL:

    http://127.0.0.1:8000

Health check:

    http://127.0.0.1:8000/

---

## Test the API

Keep the backend running, then open a new terminal and run:

    curl -X POST http://127.0.0.1:8000/generate \
      -H "Content-Type: application/json" \
      -d '{"youtube_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

Expected response:

    {
      "status": "ok",
      "mode": "mock",
      "tab": "..."
    }

---

## Frontend integration

The frontend lives here:

    docs/mega-guitar/

Live frontend:

    https://mcamner.github.io/coolThing/mega-guitar/

The frontend currently calls the local backend endpoint:

    http://127.0.0.1:8000/generate

---

## Development flow

1. Start the backend locally.
2. Open the Mega Guitar frontend.
3. Click `Load demo`.
4. Click `Generate Tabs`.
5. Confirm the backend receives `POST /generate`.
6. Confirm the tab result renders in the browser.

---

## Future backend roadmap

Next backend improvements:

- accept real audio input
- extract audio with FFmpeg
- run Basic Pitch or similar transcription model
- return MIDI/note data
- map notes to guitar string/fret positions
- return structured tab JSON
- later render with AlphaTab or custom tab UI

---

## Important note

GitHub Pages can host the frontend, but it cannot run Python, FFmpeg, or AI models.

That is why this backend runs separately.
