import type { GameState, Vector2, WorldMap } from "./types";

export const FOLD_ENTRANCE_STONE_POSITION: Vector2 = { x: 12, y: 9 };
export const FOLD_ENTRANCE_STONE_TILES: Vector2[] = [{ x: 12, y: 9 }];

export function isFoldEntranceStoneMoved(state: GameState): boolean {
  return Boolean(state.flags.foldEntranceStoneMoved);
}

export function withFoldStoneCollision(state: GameState, map: WorldMap): WorldMap {
  if (state.currentArea !== "fold-of-the-lost" || state.currentRoom !== "fold-entrance") {
    return map;
  }

  if (isFoldEntranceStoneMoved(state)) {
    return map;
  }

  return {
    ...map,
    blockedTiles: [...map.blockedTiles, ...FOLD_ENTRANCE_STONE_TILES],
  };
}
