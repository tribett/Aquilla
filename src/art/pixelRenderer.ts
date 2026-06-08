import Phaser from "phaser";
import type { PixelAsset } from "./aquillaArt";

export function hexToNumber(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

export function drawPixelAsset(
  graphics: Phaser.GameObjects.Graphics,
  asset: PixelAsset,
  x: number,
  y: number,
  scale: number,
): void {
  for (let rowIndex = 0; rowIndex < asset.rows.length; rowIndex += 1) {
    const row = asset.rows[rowIndex];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      const key = row[columnIndex];

      if (key === "." || key === " ") {
        continue;
      }

      const color = asset.palette[key];
      if (!color) {
        continue;
      }

      graphics.fillStyle(hexToNumber(color), 1);
      graphics.fillRect(x + columnIndex * scale, y + rowIndex * scale, scale, scale);
    }
  }
}

export function drawTileScene(
  graphics: Phaser.GameObjects.Graphics,
  sceneMap: readonly string[],
  tiles: Readonly<Record<string, PixelAsset>>,
  x: number,
  y: number,
  scale: number,
): void {
  const tileSize = 16 * scale;

  for (let rowIndex = 0; rowIndex < sceneMap.length; rowIndex += 1) {
    const row = sceneMap[rowIndex];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      const asset = tiles[row[columnIndex]];
      if (!asset) {
        continue;
      }

      drawPixelAsset(graphics, asset, x + columnIndex * tileSize, y + rowIndex * tileSize, scale);
    }
  }
}
