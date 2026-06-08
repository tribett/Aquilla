import type { Direction, GameState, Vector2, WorldMap } from "./types";

const DIRECTION_DELTAS: Record<Direction, Vector2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function movePlayer(state: GameState, direction: Direction, map: WorldMap): GameState {
  const delta = DIRECTION_DELTAS[direction];
  const destination = {
    x: state.player.position.x + delta.x,
    y: state.player.position.y + delta.y,
  };

  if (isBlocked(destination, map)) {
    return {
      ...state,
      player: {
        ...state.player,
        facing: direction,
      },
    };
  }

  return {
    ...state,
    player: {
      ...state.player,
      position: destination,
      facing: direction,
    },
  };
}

function isBlocked(position: Vector2, map: WorldMap): boolean {
  const outsideMap =
    position.x < 0 || position.y < 0 || position.x >= map.width || position.y >= map.height;

  return (
    outsideMap ||
    map.blockedTiles.some((blocked) => blocked.x === position.x && blocked.y === position.y)
  );
}
