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
    │   └── mega-guitar/
    │       ├── index.html
    │       ├── app.js
    │       └── styles.css
    ├── tools/
    │   ├── README.md
    │   ├── connect-any-repo.sh
    │   └── run-mega-guitar-backend.sh
    ├── README.md
    ├── LICENSE
    └── .gitignore

## Web experiments

### Mega Movie Tube

Nintendo-inspired streaming launcher. Cartridge-style cards for each streaming service.

File:

    docs/mega-movie/index.html

Live:

    https://mcamner.github.io/coolThing/mega-movie/

### Mega Guitar Tabs

Mini-app concept for generating guitar tabs from a YouTube link.

Frontend files:

    docs/mega-guitar/index.html
    docs/mega-guitar/app.js
    docs/mega-guitar/styles.css

Live frontend:

    https://mcamner.github.io/coolThing/mega-guitar/

## Backend

Mega Guitar has a local FastAPI backend.

Backend files:

    backend/app.py
    backend/requirements.txt
    backend/README.md

Run backend manually:

    cd backend
    source .venv/bin/activate
    uvicorn app:app --reload --port 8000

Or use the helper script:

    ./tools/run-mega-guitar-backend.sh

Backend URL:

    http://127.0.0.1:8000

Generate endpoint:

    POST /generate

Current mode:

    mock backend response

Planned mode:

    audio transcription → MIDI/note data → guitar tab mapping

## Tools

### connect-any-repo.sh

Shell script that connects any local folder to any GitHub repository.

Run from repo root:

    chmod +x tools/connect-any-repo.sh
    ./tools/connect-any-repo.sh

### run-mega-guitar-backend.sh

Starts the local Mega Guitar backend.

Run from repo root:

    chmod +x tools/run-mega-guitar-backend.sh
    ./tools/run-mega-guitar-backend.sh

## Demo flow

1. Start the backend:

       ./tools/run-mega-guitar-backend.sh

2. Open the frontend:

       https://mcamner.github.io/coolThing/mega-guitar/?v=api1

3. Click Load demo.

4. Click Generate Tabs.

5. Confirm backend receives:

       POST /generate

6. Confirm tab output renders in the browser.

## Folder rules

    docs/    = GitHub Pages, HTML, CSS, JS, browser UI
    backend/ = Python FastAPI backend
    tools/   = shell scripts, CLI utilities, automation

## License

MIT
