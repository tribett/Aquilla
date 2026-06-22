import type { Direction, GameState } from "./types";
import { getRoom } from "../content/worldRegistry";

export interface RoomTransitionResult {
  message: string;
  state: GameState;
}

export function tryRoomTransition(
  state: GameState,
  direction: Direction,
  movementBlocked: boolean,
): RoomTransitionResult | undefined {
  if (!movementBlocked) return undefined;

  const room = getRoom(state.currentRoom);
  const transition = room.transitions.find((candidate) => {
    if (candidate.direction !== direction) return false;
    if (!candidate.when) return true;
    return candidate.when(state);
  });

  if (!transition) return undefined;

  return {
    message: `Aquilla enters ${getRoom(transition.targetRoom).label}.`,
    state: {
      ...state,
      currentArea: transition.targetArea,
      currentRoom: transition.targetRoom,
      region: getRoom(transition.targetRoom).regionId,
      dog: {
        ...state.dog,
        command: "follow",
        position: transition.spawn.dog,
      },
      player: {
        ...state.player,
        facing: direction,
        position: transition.spawn.player,
      },
    },
  };
}

export function enterRoom(
  state: GameState,
  roomId: string,
  spawn: { player: { x: number; y: number }; dog: { x: number; y: number } },
): GameState {
  const room = getRoom(roomId);

  return {
    ...state,
    currentArea: room.areaId,
    currentRoom: room.id,
    region: room.regionId,
    dog: {
      ...state.dog,
      command: "follow",
      position: spawn.dog,
    },
    player: {
      ...state.player,
      position: spawn.player,
    },
  };
}
