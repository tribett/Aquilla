# Aquilla — Steam Depot Guide

Use this guide to upload Aquilla to Steam via SteamPipe after you have a Steamworks partner account and App ID.

## 1. Configure your App ID

Replace `steam/steam_appid.txt` with your real Steam App ID (not `480`, which is Spacewar for local API testing only).

The same file is bundled beside the game executable for Steam overlay testing.

## 2. Build distributables

```bash
npm run steam:release
```

This runs:

1. `npm run icon` — generates `build/icon.png`
2. `npm run electron:dist` — builds platform installers/unpacked folders in `release/`
3. `npm run steam:depot` — copies the build into `steam/depot/` for upload

On macOS you get `release/mac-arm64/Aquilla.app`.  
On Windows (cross-build or CI): `release/win-unpacked/`.  
On Linux: `release/linux-unpacked/`.

## 3. Steamworks depot layout

Upload the contents of `steam/depot/` to your default depot:

| Platform | Launch executable |
|----------|-------------------|
| Windows | `Aquilla.exe` |
| macOS | `Aquilla.app/Contents/MacOS/Aquilla` |
| Linux | `aquilla` |

Set Steam launch option: `%command%` (default).

## 4. Achievements (Steamworks configuration)

Map these API names in Steamworks → Stats & Achievements (see `src/game/achievements.ts`):

| Steam API name | Display name |
|----------------|--------------|
| `FOLD_RESTORED` | Refuge Remembered |
| `CHAPTER_ONE` | Sent Forth |
| `LANTERN_CLAIMED` | Lantern of Witness |
| `HARP_CLAIMED` | Harp of Remembrance |
| `LUCENT_SHATTERED` | False Unity Broken |
| `CROWN_WITNESS` | Crown Witness |

Achievements unlock in-game from save progress. Wire Steamworks SDK (`steamworks.js` or Greenworks) to call `SetAchievement` when flags change — optional bridge; game tracks progress without Steam.

## 5. Store page assets

Draft copy: `docs/store/STEAM_PAGE.md`

Required capsules (upload in Steamworks):

- Header capsule: 460×215
- Main capsule: 616×353
- Small capsule: 231×87
- Library hero: 3840×1240
- Library logo: 1280×720
- Icon: use `build/icon.png` (512×512)

## 6. System requirements (desktop)

**Minimum:** Windows 10 / macOS 12 / Ubuntu 22.04, 4 GB RAM, 500 MB disk, keyboard  
**Recommended:** 1920×1080 display, headphones

## 7. Pre-upload checklist

- [ ] `npm run verify` passes
- [ ] `npm run electron:dist` on each target platform (or CI matrix)
- [ ] Smoke-test packaged build (title → Act I → save → reload)
- [ ] Replace `steam_appid.txt` with production App ID
- [ ] Code-sign Windows/macOS builds for player trust (optional but recommended)
- [ ] Upload depots and set live branch
