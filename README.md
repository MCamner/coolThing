# coolThing 🎸✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.1-blue.svg)](VERSION)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/mcamner/coolThing/graphs/commit-activity)

Retro web experiments, local music tools, and small repo utilities.

**Live site:** [https://mcamner.github.io/coolThing/](https://mcamner.github.io/coolThing/)

---

## What's inside

- `docs/` - static GitHub Pages site and browser experiments
- `backend/` - local FastAPI backend for music features
- `tools/` - shell scripts for local development and repo workflow

## Projects

### 👁 PromptImage
AI Vision for Perchance.org. Upload an image to generate high-quality positive and negative prompts using GPT-4o-mini vision.

- **Files:** `docs/prompt-image/index.html`, `backend/app.py`
- **Local:** `http://localhost:3000/prompt-image/`

### 🎸 Mega Guitar Tabs
MTV-style guitar tab generator prototype. The browser UI sends a YouTube URL to the local backend, which downloads audio, runs Basic Pitch transcription, detects chords, transcribes lyrics (via Whisper), and returns a generated guitar tab.

- **Files:** `docs/mega-guitar/`, `backend/app.py`
- **Live Demo:** [Mega Guitar](https://mcamner.github.io/coolThing/mega-guitar/?v=mtv1)

### 🎵 Mega Now
Spotify "now playing" display with album art, audio features, and handoff to Mega Guitar.

- **Files:** `docs/mega-now/index.html`, `backend/app.py`
- **Local:** `http://localhost:3000/mega-now/`

---

## Quick start

### 🚀 Installation & Launch
Start the backend and local frontend together:
```bash
# Install dependencies and start servers
./tools/start.sh
```
Then open [http://localhost:3000/](http://localhost:3000/).

### 🛠 Individual components
- **Backend:** `./tools/run-mega-guitar-backend.sh`
- **Frontend:** `./tools/serve-frontend.sh`

---

## Examples

### 🖼 Generate Image Prompts
Use the PromptImage API directly:
```bash
curl -X POST http://127.0.0.1:8001/prompt-image -F "file=@image.jpg"
```

### 🎤 Local Lyrics Transcription
Example of using the API to transcribe lyrics:
```bash
curl -X POST http://127.0.0.1:8001/lyrics -F "file=@myaudio.mp3"
```

---

## Screenshots & Demo

Check out the [Screenshots Gallery](docs/screenshots/) for a visual overview of the different tools.

![Main Demo](docs/screenshots/main-demo.png)

---

## Roadmap

Check the [Roadmap](ROADMAP.md) for future plans:
- [ ] **Mobile App:** React Native wrapper for Mega Tuner and Setlist.
- [ ] **AI Harmony:** Add backing track generation using Riffusion.
- [ ] **PromptHistory:** Save previous image prompts in local storage.

---

## Contributing

We love contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) to get started.
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Security & Safety

This project runs locally. Ensure your **OPENAI_API_KEY** and Spotify credentials are kept in a non-committed `.env` file. The backend does not expose ports to the public internet by default.

---

## License

[MIT](LICENSE) © 2026 Mattias Camner
