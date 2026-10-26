---
name: frontend-accessibility
description: Use when adding or reviewing controls, focus styles, keyboard navigation, color contrast, form labels, status/error messages, or screen-reader behavior in coolThing static frontends under docs/.
---

# Frontend Accessibility

Use this skill to keep coolThing's retro tools usable with keyboard, screen
readers, and low-contrast-sensitive eyes without losing the visual style.

## When to use

- Adding or changing buttons, inputs, selects, toggles, file uploads, or drop zones
- Changing colors used for text, borders on controls, or status indicators
- Adding status text that changes while a tool works (loading, complete, error)
- Reviewing a frontend before release

## When not to use

- Palette, typography, or token naming decisions — use `retro-design-system`
- Layout and app structure changes with no control or color impact — use `retro-frontend-maintainer`
- Backend-only changes

## Current State (2026-10)

Measured across `docs/index.html` and `docs/*/index.html`:

- `aria-` attributes: at most one per page; none in `mega-guitar`, `mega-movie`, `mega-now`, `prompt-image`.
- `:focus` / `:focus-visible` styles: only `mega-setlist`.
- `outline: none` / `outline: 0`: `mega-setlist` (2), `mega-guitar/styles.css` (1). Each must have a visible replacement focus style.
- Contrast below 4.5:1 for normal text: `--red` `#e4000f` on `--black` `#111` is 3.87:1 (used as text color in `mega-now` and `mega-movie`).
- `prompt-image` `--accent-dim` `#770077` on `--bg` is 1.93:1. Acceptable only as decoration (it is a box-shadow today), never for text or control borders.

Treat these as known debt. Do not make them worse; fix them when touching the
affected component.

## Rules

1. **Keyboard:** every action reachable with Tab and triggered with Enter/Space. Drop zones must also have a real `<input type="file">` or a focusable button that opens one.
2. **Visible focus:** use `:focus-visible` with an outline or glow in the page's accent color, at least 2px. Never remove the outline without a replacement.
3. **Labels:** every input and select has a `<label for>` or `aria-label`. Icon-only and text-like buttons ("COPY") need a label that says what is copied.
4. **Live status:** status text that changes during work (`INTERPRETING...`, `COMPLETE`, `ERROR: ...`) goes in an element with `role="status"` or `aria-live="polite"`. Errors may use `role="alert"`.
5. **Contrast:** body text and control labels at least 4.5:1 against their actual background; large text (≥24px, or ≥19px bold) and control borders at least 3:1. Neon colors on black usually pass; dark accents (`#770077`, `#0033a0`) on black do not.
6. **Color is not the only signal:** online/offline, error/success, and selected states also need text or an icon.
7. **Motion:** scanlines, flicker, and animated backgrounds respect `@media (prefers-reduced-motion: reduce)`.
8. **Media permissions:** when microphone or camera access is denied or unavailable, show a text message and keep the rest of the page working (see `retro-frontend-maintainer`).

## Contrast Check

```bash
python3 -c "
def L(h):
    c=[int(h.lstrip('#')[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return .2126*c[0]+.7152*c[1]+.0722*c[2]
a,b=sorted([L('#e4000f'),L('#111111')],reverse=True)
print(round((a+.05)/(b+.05),2))"
```

Replace the two hex values with the foreground and background being checked.

## Verification

- Tab through the changed page from the address bar: every control gets visible focus in a sensible order.
- Operate the main flow with keyboard only.
- macOS VoiceOver (Cmd+F5): controls are announced with their labels; status changes are read aloud.
- Run the contrast check for every new or changed text/background pair.
- Grep the changed file for `outline: none|outline: 0` and confirm a replacement focus style.

## Review Standard

Lead with controls that cannot be reached or operated by keyboard, missing
focus indication, unlabeled inputs, silent status changes, and text below
4.5:1 contrast.
