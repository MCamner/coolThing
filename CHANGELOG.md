# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file.

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
