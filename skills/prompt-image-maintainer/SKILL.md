---
name: prompt-image-maintainer
description: Use when changing coolThing PromptImage frontend, /prompt-image backend endpoint, style/detail options, Ollama/OpenAI provider behavior, image upload UX, or prompt-generation smoke tests.
---

# PromptImage Maintainer

Use this skill for the PromptImage tool.

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
4. Update README if the option is user-facing enough to document.
5. Run smoke.

## UX Rules

- Upload flow should be obvious.
- Provider choice should communicate local vs OpenAI behavior.
- Copy buttons should remain easy to use.
- Generated prompt fields should be editable and copyable.
- Errors should say whether the backend, Ollama, or OpenAI key is missing.
- Do not force style tags into output unless user selected them.

## Backend Rules

- Keep uploaded image in memory only unless explicitly changing storage.
- Do not log image contents or API keys.
- Return valid JSON to the frontend.
- When model output is not JSON, preserve fallback behavior.

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
