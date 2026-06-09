import type { GameState, Vector2, WorldMap } from "./types";

export const SHEPHERD_GATE_PLATE_POSITION: Vector2 = { x: 9, y: 6 };
export const SHEPHERD_GATE_TILES: Vector2[] = [
  { x: 14, y: 5 },
  { x: 14, y: 6 },
  { x: 14, y: 7 },
  { x: 14, y: 8 },
  { x: 14, y: 9 },
  { x: 14, y: 10 },
  { x: 14, y: 11 },
];

export function isShepherdGateOpen(state: GameState): boolean {
  return (
    state.objectives.foldRestored ||
    (
      state.dog.command === "stay" &&
      state.dog.position.x === SHEPHERD_GATE_PLATE_POSITION.x &&
      state.dog.position.y === SHEPHERD_GATE_PLATE_POSITION.y
    )
  );
}

export function sendDogToShepherdGatePlate(state: GameState): GameState {
  return {
    ...state,
    dog: {
      ...state.dog,
      command: "fetch",
      position: { ...SHEPHERD_GATE_PLATE_POSITION },
    },
  };
}

export function withShepherdGateCollision(state: GameState, map: WorldMap): WorldMap {
  if (state.currentArea !== "briarfold" || isShepherdGateOpen(state)) {
    return map;
  }

  return {
    ...map,
    blockedTiles: [...map.blockedTiles, ...SHEPHERD_GATE_TILES],
  };
}
