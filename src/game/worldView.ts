import type { Direction, GameState, WorldMap } from "./types";
import { getRoom } from "../content/worldRegistry";

const DIRECTION_DELTAS: Record<Direction, { x: number; y: number }> = {
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
};

export function isOutsideMap(position: { x: number; y: number }, map: WorldMap): boolean {
  return position.x < 0 || position.y < 0 || position.x >= map.width || position.y >= map.height;
}

export function getSceneMapForState(state: GameState): readonly string[] {
  return getRoom(state.currentRoom).sceneMap;
}

export function getRoomLabel(state: GameState): string {
  return getRoom(state.currentRoom).label;
}

export function wouldLeaveMap(state: GameState, direction: Direction, map: WorldMap): boolean {
  const delta = DIRECTION_DELTAS[direction];
  const destination = {
    x: state.player.position.x + delta.x,
    y: state.player.position.y + delta.y,
  };

  return isOutsideMap(destination, map);
}
