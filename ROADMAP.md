# Roadmap

This file tracks future ideas for **coolThing**.

## Status

Current phase:

```text
parked / idea backlog
```

No active release is scheduled. The ideas below are not commitments; promote a
small `v0.2.0` only when you decide to work on coolThing again.

## Candidate v0.2.0

- Mobile-first CSS for the Mega tools
- Mega Tuner frequency spectrum visualizer
- Local Storage export/import for Mega Setlist data as JSON
- React Native or Flutter wrapper for Mega Tuner and Setlist
- AI harmony/backing-track generation experiments
- Better transcription model experiments
- Optional Supabase cloud sync
- Web MIDI support
- MQ ecosystem integration through `mq-agent`
- Optional TensorFlow-powered audio or image model features
- Optional lightweight TFLite models for faster local/mobile-friendly ML

## Repo-local Skill Maintenance

coolThing should keep only its own skill surface here. The broader MQ Skill
System v2.0 roadmap belongs in `mq-agent`, where cross-repo routing,
orchestration, trigger quality, eval standards, and output contracts can be
owned centrally.

Current coolThing skill status:

- [x] Add repo-local `SKILLS.md`
- [x] Keep listed skills linked to real `skills/<name>/SKILL.md` files
- [x] Add repo-local eval prompts under `skills/<name>/evals/evals.json`
- [x] Define coolThing's repository responsibility boundary in `SKILLS.md`
- [ ] Keep skill descriptions trigger-strong as features evolve
- [ ] Keep eval prompts aligned when adding, renaming, or removing skills
- [ ] Re-check skill docs before any future release

---

Last updated: June 2026
