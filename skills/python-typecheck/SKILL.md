---
name: python-typecheck
description: Use when writing or changing Python in coolThing backend/app.py or tests/, including test stubs, fakes, mocks, and option dicts, or when VS Code shows mypy errors such as attr-defined or arg-type.
---

# Python Typecheck

Use this skill to keep `backend/app.py` and `tests/` free of mypy errors. The
VS Code mypy extension reports them in the editor, and CI fails on them
(step "Type-check backend and tests" in `.github/workflows/ci.yml`).

## When to use

- Adding or changing functions, dicts, or imports in `backend/app.py`
- Adding tests, module stubs, fake objects, or mocked exceptions in `tests/`
- VS Code shows `Mypy` diagnostics in a Python file

## When not to use

- Frontend files under `docs/` — use `retro-frontend-maintainer`
- Shell scripts — `bash -n tools/*.sh` covers syntax
- Runtime behavior bugs — mypy passing does not replace the unit tests

## Gate

Run before declaring Python work done, together with the tests:

```bash
./tools/typecheck.sh
backend/.venv/bin/python -m unittest discover -s tests
```

Expected: `Success: no issues found in 2 source files`. Any new error is
yours to fix in the same change; do not leave it for later.

Do not run plain `mypy backend/app.py tests/`:

- Without `--python-executable backend/.venv/bin/python`, mypy cannot find
  `fastapi`, `librosa`, and others and reports `import-not-found` noise that
  VS Code does not show.
- Without `mypy.ini` (`explicit_package_bases`), mypy stops with "Source file
  found twice under different module names" because tests import
  `backend.app`. Run from the repo root so the config is picked up.

`tools/typecheck.sh` handles both. Without `backend/.venv` (CI) it uses
`$PYTHON` or `python3`.

## CI Environment

CI installs only `fastapi`, `pydantic`, `python-multipart`, `requests`,
`mypy`, and `types-requests`. `mypy.ini` sets `ignore_missing_imports` for the
heavy runtime packages (`yt_dlp`, `basic_pitch`, `librosa`, `numpy`,
`faster_whisper`, `openai`), so in CI they are typed as `Any`. The local run is
therefore at least as strict as CI.

- New third-party import in `backend/app.py`: add it to the CI install list if
  it is light, otherwise to the `ignore_missing_imports` section in `mypy.ini`.
- Changing the mypy version: update it in `ci.yml` and check that
  `./tools/typecheck.sh` still passes locally.

## Patterns That Caused Errors Here

| Error | Cause | Fix |
| --- | --- | --- |
| `Module has no attribute "X"` [attr-defined] | Assigning to a `ModuleType` stub: `mod.X = ...` | `setattr(mod, "X", ...)` |
| `Argument 1 ... has incompatible type "FakeUpload"; expected "UploadFile"` [arg-type] | Passing a duck-typed fake where the code is annotated with the real type | Factory that returns `cast(UploadFile, _FakeUpload(...))`; keep the fake minimal |
| `Argument 4 to "HTTPError" has incompatible type "None"` [arg-type] | Building stdlib exceptions with `None` for typed fields | Pass a real object: `email.message.Message()` for headers |
| `Argument after ** must be a mapping, not "object"` [arg-type] | A list of dicts with mixed value types is inferred as `list[dict[str, object]]`, then unpacked with `**` | Annotate: `attempts: list[dict[str, Any]] = [...]` |

Rules:

- Annotate new functions, including tests (`-> None`).
- Annotate dict and list literals whose values mix types and are later
  unpacked or passed on.
- Prefer `cast` at one factory over `# type: ignore` at every call site.
- Use `# type: ignore[code]` only for third-party modules without stubs, as
  `backend/app.py` already does for `yt_dlp` and `basic_pitch`; always include
  the error code.

## Review Standard

Lead with new mypy errors from `./tools/typecheck.sh`, bare
`# type: ignore` without an error code, and fakes passed without a typed
factory.
