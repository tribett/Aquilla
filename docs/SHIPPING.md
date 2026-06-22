# Aquilla — Shipping Checklist

## Playable content

- [x] Chapter I: Briarfold → Fold → Old Pasture → Lantern Ruins → Sanctum → homecoming finale
- [x] Chapter II: Ashford → Ember Fen → Ashen Spire → Lantern of Witness
- [x] Chapter III: Kingsroad snares → Undercroft seal → Monastic hymns → Memory Thief → Harp
- [x] Chapter IV: Elarion Gate → Cathedral worship → Lucent Court
- [x] Chapter V: Return from Lucent throne → Crown Witness with Elder Mara
- [x] Eight dungeons tracked in journal
- [x] 18 side quests defined
- [x] Fold entrance stone puzzle (staff), thorn beast, shadowed wolf
- [x] Dog danger warnings near prowlers and fold threats
- [x] Six achievements (Steam API names in `src/game/achievements.ts`)
- [x] Full script: `docs/story/FULL_SCRIPT.md`

## Quality gates

Run before every release candidate:

```bash
npm run verify
```

Expected: 78+ unit tests, 32 e2e tests (including full Acts I–V playthrough), clean `tsc` build.

For Steam/desktop packaging:

```bash
npm run verify:steam
```

## Manual smoke test

1. `npm run electron:start` → title → Chapter I through Sanctum ending
2. Rest at Briarfold; cross Fold east to Ashford (Chapter II)
3. Ember Fen channels → sentinel → shrine → Ashen Spire archon → lantern
4. Kingsroad snares → undercroft → monastic hymns → Memory Thief → harp (1–5)
5. Elarion → cathedral worship → Lucent sentinel → throne return home
6. Elder Mara → Crown Witness dialogue → ending panel
7. Journal → Achievements section shows progress

## Desktop / Steam packaging

Aquilla ships with an Electron wrapper for desktop play and Steam builds.

```bash
# Dev: Vite + Electron window
npm run electron:dev

# Production build + desktop window
npm run electron:start

# Unpacked app (fast smoke test)
npm run electron:pack

# Full distributables (NSIS / dmg / AppImage) + Steam depot prep
npm run steam:release
```

Output:

- `release/mac-arm64/Aquilla.app` (macOS)
- `release/win-unpacked/` (Windows Steam depot)
- `release/linux-unpacked/` (Linux Steam depot)
- `steam/depot/` — copy for SteamPipe upload

Full Steam upload guide: `docs/store/STEAM_DEPOT.md`

Steam checklist:

1. Replace `steam/steam_appid.txt` with your Steam App ID
2. Run `npm run steam:release` on each target platform (or CI matrix)
3. Configure achievements in Steamworks using API names from `src/game/achievements.ts`
4. Upload store capsules; copy from `docs/store/STEAM_PAGE.md`
5. Code-sign builds before public release (recommended)

## Known scope boundaries

- Procedural dungeon tiles (not unique LTTP-style maps per room)
- Web Audio tone stubs (not recorded soundtrack stems)
- Steamworks SDK bridge optional — achievements work in-game; wire `SetAchievement` for Steam sync
- macOS/Linux builds require building on target OS or CI matrix
