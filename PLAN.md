# Aquilla — Implementation Plan

This file is the canonical PLAN entry point for agent loops.

**Source of truth:** [`docs/superpowers/plans/2026-06-08-aquilla-vertical-slice.md`](docs/superpowers/plans/2026-06-08-aquilla-vertical-slice.md)

## Vertical slice tasks (Tasks 1–12)

All twelve tasks from the vertical slice plan are implemented. The repo has expanded beyond the slice into the full five-chapter epic.

## Verification

```bash
npm run verify          # unit + build + e2e + electron pack
npm run steam:release   # full distributables + steam/depot/
```

See `docs/store/STEAM_DEPOT.md` for SteamPipe upload.

## Post-slice work (in repo)

- Acts II–V epic content (`src/game/epic*.ts`, `tests/e2e/full-playthrough.spec.ts`)
- Electron shell (`electron/main.cjs`, `npm run electron:*`)
- Side quests, journal, map, save v6, procedural dungeon templates
