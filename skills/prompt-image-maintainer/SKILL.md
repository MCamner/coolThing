---
name: prompt-image-maintainer
description: Use when changing coolThing PromptImage frontend, /prompt-image backend endpoint, style/detail options, Ollama/OpenAI provider behavior, image upload UX, or prompt-generation smoke tests.
---

# PromptImage Maintainer

Use this skill for the PromptImage tool.

## When to use

- Changing PromptImage frontend, `/prompt-image` backend endpoint, style/detail options, or provider behavior
- Debugging upload UX, provider errors, or prompt-generation smoke failures
- Adding or updating smoke tests for the PromptImage workflow

## When not to use

- Other music/API endpoints — use `backend-music-tools-maintainer`
- Frontend-only retro UI changes unrelated to PromptImage — use `retro-frontend-maintainer`
- Local port or startup changes — use `local-dev-server-maintainer`

## Core Files

- `docs/prompt-image/index.html`
- `backend/app.py`
- `tools/smoke-prompt-image.sh`
- `tasks/prompt-image-smoke.yaml`
- `README.md`

## Feature Contract

PromptImage accepts an image and returns:

- `prompt`
- `negative_prompt`
- optional `variations`

It supports providers:

- `ollama` with local vision model such as `bakllava`
- `openai` with `gpt-4o-mini` and `OPENAI_API_KEY`

Style and detail controls must be present in both frontend and backend.

## Adding A Style Or Detail Option

1. Add the option to frontend `<select>`.
2. Add matching key to `_STYLE_OPTIONS` or `_DETAIL_OPTIONS` in `backend/app.py`.
3. Update `tools/smoke-prompt-image.sh`.
4. Update README for any option that appears in the UI, affects user-visible output, or changes the documented workflow; do not update README for internal-only or non-user-visible options.
5. Run smoke.

## UX Rules

- The upload flow must show: (1) a visible file input, (2) a clear upload button, (3) a success/error state after upload, and (4) the next action to generate a prompt.
- The provider selector must clearly label each option as `Local (Ollama)` or `OpenAI`, and show a short helper text stating whether the option uses local inference or the OpenAI API key.
- Copy buttons must remain visible, have a clear label or icon, and copy the full field value on one click.
- Editable prompt fields must allow direct text changes and preserve the current field value when the user copies or regenerates output.
- If Ollama is selected but the backend cannot reach the Ollama service, return `Error: Ollama unavailable`. If OpenAI is selected and `OPENAI_API_KEY` is not set, return `Error: OpenAI API key missing`. If the backend service itself fails, return `Error: backend unavailable`.
- Do not force style tags into output unless user selected them.
- If variations are not returned by the provider, treat them as `[]` and continue without failing the request; do not show a broken empty-state UI for the variations section.

## Backend Rules

- Keep uploaded image in memory only unless explicitly changing storage.
- Do not log image contents or API keys.
- Return valid JSON to the frontend.
- If the provider returns non-JSON or malformed JSON, keep the previous valid `prompt`/`negative_prompt` values in the UI, return the existing fallback response shape, and show a non-fatal error message instead of crashing the page.
- If the provider response is not valid JSON, do not throw an unhandled exception; return a structured error object with an explicit `provider_error` code and preserve the last known good result in the frontend.

## Verification

```bash
./tools/smoke-prompt-image.sh
```

Manual local flow:

```bash
./tools/start.sh
open http://localhost:3000/prompt-image/
```

Check upload, provider selection, variations, copy buttons, and error state.
