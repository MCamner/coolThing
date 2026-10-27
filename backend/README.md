# Mega Guitar Backend

Local FastAPI backend for the Mega Guitar mini-app.

The backend runs local music and image workflows for the static frontend. Mega Guitar downloads audio from a validated YouTube URL, transcribes notes with Basic Pitch, detects chords, and can transcribe lyrics with faster-whisper.

---

## What it does

The backend exposes one main API endpoint:

    POST /generate

The frontend sends a YouTube URL and receives generated tab and chord data as JSON.

Current mode:

    YouTube audio → Basic Pitch note events → guitar tab mapping

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

If YouTube rejects anonymous downloads with HTTP 403, enable explicit local
browser-cookie access in `backend/.env`:

    YT_DLP_COOKIES_FROM_BROWSER=chrome

See `.env.example` for supported browser names. Browser cookies are read only
when this setting is present. Keep `.env` local and never commit it.

---

## Run locally

Start the backend server:

    uvicorn app:app --reload --port 8001

Backend URL:

    http://127.0.0.1:8001

Health check:

    http://127.0.0.1:8001/

---

## Test the API

Keep the backend running, then open a new terminal and run:

    curl -X POST http://127.0.0.1:8001/generate \
      -H "Content-Type: application/json" \
      -d '{"youtube_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

Expected response:

    {
      "status": "ok",
      "mode": "basic-pitch transcription",
      "tab": "..."
    }

---

## Frontend integration

The frontend lives here:

    docs/mega-guitar/

Live frontend:

    https://mcamner.github.io/coolThing/mega-guitar/

The frontend currently calls the local backend endpoint:

    http://127.0.0.1:8001/generate

---

## Development flow

1. Start the backend locally.
2. Open the Mega Guitar frontend.
3. Click `Load demo`.
4. Click `Generate Tabs`.
5. Confirm the backend receives `POST /generate`.
6. Confirm the tab result renders in the browser.

---

## Additional endpoints

* `POST /chords` accepts the same `youtube_url` JSON body.
* `POST /lyrics` accepts the same `youtube_url` JSON body and runs faster-whisper.
* `POST /prompt-image` accepts JPEG, PNG, WebP, or GIF multipart uploads up to 10 MiB by default. Override with `MAX_IMAGE_UPLOAD_BYTES`. The local provider uses Ollama model `qwen3.5:9b`; override with `OLLAMA_VISION_MODEL` (the model must support vision).
* Spotify endpoints use credentials supplied through environment variables.

External HTTP calls default to a 15-second timeout. Override with `HTTP_TIMEOUT_SECONDS`.

## Future backend roadmap

Next backend improvements:

- improve transcription accuracy and runtime feedback
- return more structured tab data
- optionally render with AlphaTab or an improved custom tab UI

---

## Important note

GitHub Pages can host the frontend, but it cannot run Python, FFmpeg, or AI models.

That is why this backend runs separately.
