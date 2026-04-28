# tools

Shell scripts and CLI utilities for the coolThing repo.

## Scripts

### connect-any-repo.sh

Connects any local folder to any GitHub repository.

Run from repo root:

    chmod +x tools/connect-any-repo.sh
    ./tools/connect-any-repo.sh

Prompts for:

- GitHub repo URL
- Local folder path (defaults to current folder)
- Branch name (defaults to main)

### run-mega-guitar-backend.sh

Starts the local FastAPI backend for Mega Guitar. Creates a virtual environment and installs requirements automatically if needed.

Run from repo root:

    chmod +x tools/run-mega-guitar-backend.sh
    ./tools/run-mega-guitar-backend.sh

Backend runs at:

    http://127.0.0.1:8000
