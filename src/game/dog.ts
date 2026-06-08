import type { DogCommand, GameState, Sheep } from "./types";

export function commandDog(state: GameState, command: DogCommand): GameState {
  return {
    ...state,
    dog: {
      ...state.dog,
      command,
    },
  };
}

export function herdNearestSheep(state: GameState): GameState {
  if (state.dog.command !== "herd") {
    return state;
  }

  const sheepToGather = state.sheep.find((sheep) => !sheep.gathered);

  if (!sheepToGather) {
    return state;
  }

  const sheep = state.sheep.map((candidate): Sheep => {
    if (candidate.id !== sheepToGather.id) {
      return candidate;
    }

    return {
      ...candidate,
      position: { x: 2, y: 2 },
      gathered: true,
    };
  });

  return {
    ...state,
    sheep,
    objectives: {
      ...state.objectives,
      gatheredSheep: state.objectives.gatheredSheep + 1,
    },
  };
}
