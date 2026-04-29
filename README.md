# coolThing

Tools, scripts and retro web experiments.

## Live site

GitHub Pages:

    https://mcamner.github.io/coolThing/

## Project structure

    coolThing/
    ├── backend/
    │   ├── app.py
    │   ├── requirements.txt
    │   └── README.md
    ├── docs/
    │   ├── index.html
    │   ├── mega-movie/
    │   │   └── index.html
    │   ├── mega-guitar/
    │   │   ├── index.html
    │   │   ├── app.js
    │   │   └── styles.css
    │   └── mega-now/
    │       └── index.html
    ├── tools/
    │   ├── README.md
    │   ├── connect-any-repo.sh
    │   ├── run-mega-guitar-backend.sh
    │   └── serve-frontend.sh
    ├── README.md
    ├── LICENSE
    └── .gitignore

## Web experiments

### Mega Movie Tube

Nintendo-inspired streaming launcher. Cartridge-style cards for each streaming service.
Includes a CRT channel-change animation on card click and a Konami code easter egg.

File:

    docs/mega-movie/index.html

Live:

    https://mcamner.github.io/coolThing/mega-movie/

### Mega Guitar Tabs

Generates guitar tabs from a YouTube link using yt-dlp and Basic Pitch audio transcription.
Supports PDF export of the generated tab.

Frontend files:

    docs/mega-guitar/index.html
    docs/mega-guitar/app.js
    docs/mega-guitar/styles.css

Live frontend:

    https://mcamner.github.io/coolThing/mega-guitar/

### Mega Now

Real-time Spotify "now playing" display. Shows track info, album art and audio features.
Sends the current track to Mega Guitar via a YouTube search with one click.
Requires Spotify OAuth login and local backend.

File:

    docs/mega-now/index.html

Local URL:

    http://localhost:3000/mega-now/

## Spotify setup

1. Create an app at developer.spotify.com
2. Add redirect URI: `http://127.0.0.1:8000/spotify/callback`
3. Set credentials before starting the backend:

       export SPOTIFY_CLIENT_ID=your_client_id
       export SPOTIFY_CLIENT_SECRET=your_client_secret

## Backend

Mega Guitar has a local FastAPI backend that downloads audio via yt-dlp and transcribes
it to guitar tab using Basic Pitch.

Backend files:

    backend/app.py
    backend/requirements.txt
    backend/README.md

Dependencies:

    fastapi, uvicorn, yt-dlp, basic-pitch[onnx], pydantic, setuptools<75, requests

## Requirements

- macOS (scripts and paths are written for macOS)
- Python 3 installed locally
- ffmpeg installed locally (`brew install ffmpeg`)

The backend and frontend scripts must be run on your local Mac — they cannot run on GitHub.
GitHub Pages only hosts the static frontend files.

## Running locally

The frontend must be served over HTTP (not GitHub Pages) when testing with the local backend,
since browsers block HTTP requests from HTTPS pages.

Terminal 1 — start backend:

    ./tools/run-mega-guitar-backend.sh

Terminal 2 — serve frontend:

    ./tools/serve-frontend.sh

Open:

    http://localhost:3000/mega-guitar/

Backend URL:

    http://127.0.0.1:8000

Generate endpoint:

    POST /generate

## Tools

### connect-any-repo.sh

Connects any local folder to any GitHub repository.

    chmod +x tools/connect-any-repo.sh
    ./tools/connect-any-repo.sh

### run-mega-guitar-backend.sh

Starts the local FastAPI backend. Creates a virtual environment and installs
requirements automatically if needed.

    chmod +x tools/run-mega-guitar-backend.sh
    ./tools/run-mega-guitar-backend.sh

### serve-frontend.sh

Serves the docs/ folder on localhost:3000. Required for local backend testing.

    chmod +x tools/serve-frontend.sh
    ./tools/serve-frontend.sh

## Folder rules

    docs/    = GitHub Pages, HTML, CSS, JS, browser UI
    backend/ = Python FastAPI backend
    tools/   = shell scripts, CLI utilities, automation

## License

MIT
