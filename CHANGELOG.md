# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

* Lightweight CI for backend safety tests, PromptImage smoke, documentation contracts, and shell syntax
* Upload size/type validation and YouTube URL allowlisting for local backend workflows
* Eval prompts for `frontend-accessibility`, `python-typecheck`, and `retro-design-system`
* `tools/check-docs.sh` checks that every skill is indexed in `SKILLS.md` and has matching evals

### Changed

* Direct backend dependencies are pinned to the locally verified versions
* README and backend documentation now match the implemented API and provider behavior

### Fixed

* Spotify HTTP calls now use bounded timeouts
* PromptImage provider failures no longer expose raw exception details
* Broken contribution and screenshot links in the README

## [0.1.1] - 2026-06-07

### Added

* Ollama/bakllava provider for prompt-image endpoint — local image-to-prompt via bakllava model
* Repo skills system: `SKILLS.md` index with seven stable skills covering frontend, backend, PromptImage, local dev server, docs, and release readiness
* `local-dev-server-maintainer` skill with port map and startup docs

### Changed

* Roadmap promoted to formal `v0.2.0` candidate list (mobile CSS, tuner spectrum, setlist export/import, MQ ecosystem integration)
* Skill ownership boundary documented: MQ platform orchestration stays in `mq-agent`, not coolThing

### Fixed

* Spotify PKCE auth flow — popup blocker and localhost redirect routing
* Spotify OAuth callback now redirects correctly to GitHub Pages after token exchange
* Ollama response parsing in prompt-image endpoint

## [0.1.0] - 2026-05-04

### Added

* Initial release setup
