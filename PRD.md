# Aquilla — Product Requirements

This file is the canonical PRD entry point for agent loops and shipping audits.

**Source of truth:** [`docs/superpowers/specs/2026-06-08-aquilla-game-design.md`](docs/superpowers/specs/2026-06-08-aquilla-game-design.md)

**Full story script:** [`docs/story/FULL_SCRIPT.md`](docs/story/FULL_SCRIPT.md)

**Shipping checklist:** [`docs/SHIPPING.md`](docs/SHIPPING.md)

## Scope summary

- Top-down 2D Christian fantasy adventure (Phaser + TypeScript)
- Mercy-first, non-lethal encounters; shepherd verbs (gather, guard, restore)
- Vertical slice: Briarfold, Fold of the Lost, staff, sheepdog Bracken
- Full epic: Chapters I–V, eight dungeons, side quests, Crown Witness finale
- Browser-first; Electron wrapper for desktop/Steam

## Launch criteria

- `npm run verify` passes (78+ unit, 32 e2e)
- `npm run verify:steam` produces `release/mac-arm64/Aquilla.app` (or Windows/Linux equivalent)
- All PRD gameplay systems implemented or explicitly deferred in SHIPPING.md
- Store/marketing copy matches shipped behavior (`docs/store/STEAM_PAGE.md`)

## Out of scope (generic checklist items)

This is a client-only browser/desktop game. There is no server, database, or auth layer — those checklist items do not apply.
