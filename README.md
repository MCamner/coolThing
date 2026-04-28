# coolThing

A collection of tools and mini-projects.

## Tools

### [Mega Movie Tube](tools/)

A retro 90s MTV-themed website that combines streaming links with a concept for AI-generated guitar tabs via YouTube. Features a CRT/scanline aesthetic, a Web Audio synthesizer, and a frontend ready to hook up to a Python backend for tab generation.

**File:** [tools/megatabs.html](tools/megatabs.html)  
**Stack:** HTML · CSS · Vanilla JS  
**Backend needed:** Python service with `basic-pitch` for the guitar tab feature (e.g. Hugging Face Spaces or Railway).

### [connect-any-repo.sh](tools/connect-any-repo.sh)

Bash script that connects any local folder to any GitHub repo — handles `git init`, remote setup, branch rename, and an initial push in one go.

```bash
bash tools/connect-any-repo.sh
```

## Docs / GitHub Pages

The `docs/` folder is served via GitHub Pages and hosts the live version of Mega Movie Tube.

## License

See [LICENSE](LICENSE).
