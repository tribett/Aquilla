#!/usr/bin/env node
/**
 * Copies electron-builder output into steam/depot/ for SteamPipe upload.
 * Run after: npm run electron:dist
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const release = join(root, "release");
const depot = join(root, "steam", "depot");

const platform = process.argv[2] ?? process.platform;
const sources = {
  darwin: join(release, "mac-arm64", "Aquilla.app"),
  win32: join(release, "win-unpacked"),
  linux: join(release, "linux-unpacked"),
};

const source = sources[platform];

if (!source || !existsSync(source)) {
  console.error(
    `Missing build at ${source ?? "unknown platform"}.\nRun npm run electron:dist first.`,
  );
  process.exit(1);
}

if (existsSync(depot)) {
  rmSync(depot, { recursive: true, force: true });
}
mkdirSync(depot, { recursive: true });

cpSync(source, join(depot, platform === "darwin" ? "Aquilla.app" : "."), {
  recursive: true,
});

writeFileSync(
  join(root, "steam", "README.txt"),
  [
    "Aquilla Steam depot contents",
    "===========================",
    "",
    "1. Replace steam/steam_appid.txt with your Steam App ID from Steamworks.",
    "2. npm run electron:dist",
    `3. node scripts/prepare-steam-depot.mjs ${platform}`,
    "4. Upload steam/depot/ to your Steam depot via SteamPipe (ContentBuilder).",
    "",
    "Launch option (Windows): Aquilla.exe",
    "Launch option (macOS): Aquilla.app/Contents/MacOS/Aquilla",
    "Launch option (Linux): aquilla",
    "",
  ].join("\n"),
);

console.log(`Steam depot prepared: steam/depot/ (from ${source})`);
