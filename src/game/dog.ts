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

  const dogPosition = state.dog.position;
  const sheepToGather = state.sheep.reduce<Sheep | undefined>((nearest, candidate) => {
    if (candidate.gathered) {
      return nearest;
    }

    if (!nearest) {
      return candidate;
    }

    const candidateDistance =
      (candidate.position.x - dogPosition.x) ** 2 + (candidate.position.y - dogPosition.y) ** 2;
    const nearestDistance =
      (nearest.position.x - dogPosition.x) ** 2 + (nearest.position.y - dogPosition.y) ** 2;

    return candidateDistance < nearestDistance ? candidate : nearest;
  }, undefined);

  if (!sheepToGather) {
    return state;
  }

  return herdSheepById(state, sheepToGather.id);
}

export function herdSheepById(state: GameState, sheepId: string): GameState {
  if (state.dog.command !== "herd") {
    return state;
  }

  const sheepToGather = state.sheep.find(
    (candidate) => candidate.id === sheepId && !candidate.gathered,
  );

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
