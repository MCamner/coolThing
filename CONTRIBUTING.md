# Contributing

## Local setup

1. Create a feature branch from `main`.
2. Run `./tools/start.sh` for the local frontend and backend.
3. Keep credentials in an untracked `.env` file.

## Before opening a pull request

Run the lightweight repository checks:

```bash
./tools/smoke-prompt-image.sh
./tools/check-docs.sh
backend/.venv/bin/python -m unittest discover -s tests -v
```

Do not commit generated media, API keys, Spotify tokens, model data, or local
virtual environments. Describe any manual music, Spotify, Ollama, or OpenAI
verification in the pull request.
