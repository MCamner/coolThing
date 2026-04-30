# coolThing

Retro web experiments, local music tools, and small repo utilities.

Live site:

    https://mcamner.github.io/coolThing/

## What's inside

- `docs/` - static GitHub Pages site and browser experiments
- `backend/` - local FastAPI backend for music features
- `tools/` - shell scripts for local development and repo workflow

## Projects

### Mega Guitar Tabs

MTV-style guitar tab generator prototype. The browser UI sends a YouTube URL to the
local backend, which downloads audio with `yt-dlp`, runs Basic Pitch transcription,
detects chords, can transcribe lyrics locally with faster-whisper, and returns a
generated guitar tab.

Files:

    docs/mega-guitar/
    backend/app.py

Live frontend:

    https://mcamner.github.io/coolThing/mega-guitar/?v=mtv1

Local frontend:

    http://localhost:3000/mega-guitar/

### Mega Now

Spotify "now playing" display. Shows the current track, album art, timing and audio
features, then can search YouTube and send the track to Mega Guitar.

Files:

    docs/mega-now/index.html
    backend/app.py

Local frontend:

    http://localhost:3000/mega-now/

### Mega Setlist

Frontend-only setlist builder. Saves songs, YouTube links, Spotify links, BPM, key,
tuning, capo and notes in browser `localStorage`, with direct handoff to Mega Guitar.

File:

    docs/mega-setlist/index.html

Live:

    https://mcamner.github.io/coolThing/mega-setlist/

Local frontend:

    http://localhost:3000/mega-setlist/

### Mega Movie Tube

90s-inspired video/web experiment with loud visuals and old-school streaming-launcher
energy.

File:

    docs/mega-movie/index.html

Live:

    https://mcamner.github.io/coolThing/mega-movie/

## Quick start

Start the backend and local frontend together:

    ./tools/start.sh

Then open:

    http://localhost:3000/

Individual commands:

    ./tools/run-mega-guitar-backend.sh
    ./tools/serve-frontend.sh

Backend URL:

    http://127.0.0.1:8000

## Spotify setup

Mega Now requires Spotify OAuth credentials.

1. Create an app at `developer.spotify.com`.
2. Add this redirect URI:

       http://127.0.0.1:8000/spotify/callback

3. Export credentials before starting the backend:

       export SPOTIFY_CLIENT_ID=your_client_id
       export SPOTIFY_CLIENT_SECRET=your_client_secret

## Requirements

- macOS or another Unix-like shell environment
- Python 3
- ffmpeg installed locally

On macOS:

    brew install ffmpeg

Python dependencies are installed from `backend/requirements.txt` by the startup scripts.
Auto Lyrics uses local Whisper transcription through `faster-whisper`; the first run may
download a model and can take time on CPU.

## API

Health check:

    GET /

Generate guitar tab:

    POST /generate

Detect chords only:

    POST /chords

Transcribe lyrics locally:

    POST /lyrics

Spotify:

    GET /spotify/login
    GET /spotify/callback
    GET /spotify/now-playing
    GET /spotify/youtube-search

## Project structure

    coolThing/
    ├── backend/
    │   ├── app.py
    │   ├── requirements.txt
    │   └── README.md
    ├── docs/
    │   ├── index.html
    │   ├── mega-guitar/
    │   ├── mega-movie/
    │   ├── mega-now/
    │   └── mega-setlist/
    ├── tools/
    │   ├── README.md
    │   ├── connect-any-repo.sh
    │   ├── run-mega-guitar-backend.sh
    │   ├── serve-frontend.sh
    │   └── start.sh
    ├── README.md
    ├── LICENSE
    └── .gitignore

## Notes

GitHub Pages only hosts the static frontend files. Anything that needs Python,
Spotify OAuth, YouTube downloads, ffmpeg, or Basic Pitch must run locally.

## License

MIT
