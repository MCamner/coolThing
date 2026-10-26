---
name: retro-frontend-maintainer
description: Use when changing coolThing static frontends, retro UI, browser experiments, GitHub Pages pages, CSS, JavaScript interactions, or app landing cards.
---

# Retro Frontend Maintainer

Use this skill for coolThing's static browser experiments and visual language.

## When to use

- Changing static frontends, retro UI, browser experiments, GitHub Pages pages, CSS, or JavaScript interactions
- Adding a new browser experiment under `docs/`
- Reviewing visual style, app landing cards, or frontend UX

## When not to use

- Backend-only changes with no frontend impact — use `backend-music-tools-maintainer`
- Local server or port changes — use `local-dev-server-maintainer`
- Palette, tokens, fonts, or visual family decisions — use `retro-design-system`
- Keyboard, focus, labels, or contrast work — use `frontend-accessibility`
- PromptImage-specific changes — use `prompt-image-maintainer`

## Frontend Surfaces

- `docs/index.html`
- `docs/prompt-image/index.html`
- `docs/mega-guitar/index.html`
- `docs/mega-guitar/app.js`
- `docs/mega-guitar/styles.css`
- `docs/mega-now/index.html`
- `docs/mega-movie/index.html`
- `docs/mega-tuner/index.html`
- `docs/mega-setlist/index.html`
- `docs/assets/social-preview.png`
- `docs/sitemap.xml`

## Visual Direction

coolThing should feel like:

- retro web lab
- local machine tools
- music/video workstation
- classified archive
- neon terminal console

It should not become:

- a generic SaaS landing page
- a bland Bootstrap dashboard
- a framework-heavy single-page app
- a marketing site with fake product copy

## UI Rules

- Keep apps usable as the first screen.
- Use real controls: inputs, file upload, select menus, toggles, buttons, result
  panels, progress/status indicators.
- Keep status visible: backend online/offline, local-only notices, current mode.
- Preserve monospace/retro styling unless changing a whole app intentionally.
- Text must fit on mobile; do not rely on huge fixed-width panels.
- Avoid decorative-only elements that compete with the actual tool.
- If a backend is required, show a clear local backend notice and endpoint.
- For server/port work, use `local-dev-server-maintainer` as the source of
  truth.

## Browser Audio And Microphone

`mega-tuner` uses `getUserMedia` and `AudioContext`. For any page that does:

- Request the microphone only after a user action (button), never on load.
- `getUserMedia` needs a secure context: `https://` (GitHub Pages) or
  `localhost` / `127.0.0.1`. It is unavailable on plain-http LAN addresses.
- Handle `NotAllowedError` (denied), `NotFoundError` (no device), and a missing
  `navigator.mediaDevices` with a visible text message, not a silent failure.
- Create or resume `AudioContext` inside the user gesture; browsers start it
  suspended otherwise.
- Stop all tracks (`stream.getTracks().forEach(t => t.stop())`) when the user
  stops listening or leaves the view.

## Visual QA And Screenshots

- Capture the changed page before and after at desktop (1280px) and mobile
  (390px) width, in backend online and offline state when relevant.
- Keep screenshots out of the repo unless README references them;
  `tools/check-docs.sh` fails if README points to a missing screenshot.
- `docs/assets/social-preview.svg` is the source for
  `docs/assets/social-preview.png`. When titles, tags, or the URL on the card
  change, edit the SVG, re-export the PNG at the same pixel size, and check
  that `tools/check-docs.sh` still passes.

## Adding A New Browser Experiment

1. Create `docs/<experiment>/index.html`.
2. Add app-specific JS/CSS only if it improves maintainability.
3. Link it from `docs/index.html`.
4. Add to `docs/sitemap.xml`.
5. Add README entry under Projects.
6. Add or update a smoke script if the app has backend/API coupling.

## Verification

```bash
cd docs
python3 -m http.server 3000 --bind 127.0.0.1
```

Check:

- `http://localhost:3000/`
- the changed app path
- `http://127.0.0.1:8001/` when the app requires the backend
- mobile width
- backend offline state
- backend online state, if relevant

## Review Standard

Lead with broken controls, unclear local/backend state, mobile layout issues,
missing index links, and style drift away from the retro tool aesthetic.
