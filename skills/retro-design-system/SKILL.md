---
name: retro-design-system
description: Use when choosing or changing colors, CSS custom properties, fonts, spacing, shared UI patterns, or the visual family of a coolThing page, or when a new page needs to match the existing look.
---

# Retro Design System

Use this skill as the source of truth for coolThing's visual tokens and shared
UI patterns. There is no shared stylesheet: each page defines its own `:root`
tokens, so consistency comes from following the conventions below.

## When to use

- Adding a new page under `docs/` and choosing its palette and fonts
- Renaming, adding, or changing CSS custom properties
- Changing fonts or moving a page between visual families
- Building a status bar, backend notice, result panel, or copy button

## When not to use

- Keyboard, focus, labels, or contrast checks — use `frontend-accessibility`
- App behavior, page wiring, index links, or sitemap — use `retro-frontend-maintainer`
- PromptImage-specific behavior — use `prompt-image-maintainer`

## Visual Families

coolThing has two deliberate families. A page belongs to exactly one.

### Terminal (default)

Pages: `docs/index.html`, `mega-setlist`, `mega-tuner`, `mega-guitar`, `prompt-image`.

- Near-black background, translucent dark panels, thin light borders, neon accents.
- Monospace UI text: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
- Display headings may use a condensed heavy face (`Impact`, `Arial Black`), as the archive index and `mega-guitar` do.

### Mega Broadcast

Pages: `mega-movie`, `mega-now`.

- Flat red/yellow/blue blocks on dark grey, like a TV channel or game-console menu.
- UI text: `ui-sans-serif, system-ui, -apple-system, sans-serif`.
- Pixel accent font: `--pixel: 'Press Start 2P', monospace` for short labels only.

New pages use **Terminal** unless they are part of the Mega Broadcast set.
Do not mix the families within one page.

## Token Contract

Terminal pages define these names (values may differ per page):

| Token | Role |
| --- | --- |
| `--bg` | page background |
| `--panel`, `--panel-strong` (or `--panel2`) | card/panel surfaces |
| `--text` | primary text |
| `--muted` | secondary text, must still reach 4.5:1 on `--panel` |
| `--line` | borders and dividers |
| `--shadow` | panel shadow |
| accents | named by hue: `--green`, `--amber`, `--cyan`, `--pink`, `--yellow`, `--red` |

Mega Broadcast pages define `--red`, `--red2`, `--yellow`, `--white`,
`--black`, `--grey`, `--grey2`, `--muted`, `--pixel`, plus page accents
(`--blue`, `--green`, `--green2`).

Known drift: `prompt-image` uses `--accent`, `--accent-dim`, and `--font`
instead of hue-named accents. Align it with the contract when its CSS is next
changed; do not copy that naming to new pages.

Rules:

- Name accents by hue, not by role (`--cyan`, not `--primary`).
- Use tokens in rules; avoid new raw hex values outside `:root`.
- Semantic meaning stays stable across pages: green = online/success, amber or yellow = working/warning, red = error/offline.

## Shared UI Patterns

- **Backend notice:** when a page needs `backend/app.py`, show the endpoint (`http://127.0.0.1:8001`) and an online/offline state with text, not color alone.
- **Status line:** uppercase short states (`READY`, `INTERPRETING...`, `COMPLETE`, `ERROR: <message>`), in a live region (see `frontend-accessibility`).
- **Result panel:** monospace output, editable where the user may tweak it, with a labeled copy button next to each field.
- **Controls:** native `<button>`, `<input>`, `<select>`; restyle them, do not rebuild them from `<div>`.

## Verification

- Extract the page's tokens and compare with the contract:

  ```bash
  awk '/:root *\{/,/\}/' docs/<page>/index.html
  ```

- Grep the changed CSS for raw hex values outside `:root`.
- View the page at desktop and 390px width next to another page of the same family.
- Run the `frontend-accessibility` contrast check for every changed text color.

## Review Standard

Lead with mixed families on one page, new role-named or one-off tokens,
semantic color changes (for example red used for success), and new raw hex
values that bypass tokens.
