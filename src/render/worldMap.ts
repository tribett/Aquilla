import type { Vector2, WorldMap } from "../game/types";

const BLOCKED_SCENE_TILES = new Set(["A", "B", "C", "L", "Q", "R", "S", "T", "W", "c", "w"]);

export function buildWorldMapFromScene(sceneMap: readonly string[]): WorldMap {
  const width = sceneMap[0]?.length ?? 0;
  const blockedTiles: Vector2[] = [];

  sceneMap.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      if (BLOCKED_SCENE_TILES.has(row[x])) {
        blockedTiles.push({ x, y });
      }
    }
  });

  return {
    width,
    height: sceneMap.length,
    blockedTiles,
  };
}
