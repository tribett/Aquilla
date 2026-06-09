import type { DogCommand, GameState, Sheep, Vector2 } from "./types";

export function commandDog(state: GameState, command: DogCommand): GameState {
  return {
    ...state,
    dog: {
      ...state.dog,
      command,
    },
  };
}

export function trailDogAfterPlayerMove(
  state: GameState,
  previousPlayerPosition: Vector2,
): GameState {
  const playerMoved =
    state.player.position.x !== previousPlayerPosition.x ||
    state.player.position.y !== previousPlayerPosition.y;

  if (state.dog.command !== "follow" || !playerMoved) {
    return state;
  }

  return {
    ...state,
    dog: {
      ...state.dog,
      position: previousPlayerPosition,
    },
  };
}

export function fetchNearestLostSheep(state: GameState): GameState {
  const sheepToFetch = getNearestLostSheep(state);

  if (!sheepToFetch) {
    return commandDog(state, "fetch");
  }

  return {
    ...state,
    dog: {
      ...state.dog,
      command: "fetch",
      position: getFetchPosition(sheepToFetch),
    },
  };
}

export function herdNearestSheep(state: GameState): GameState {
  if (state.dog.command !== "herd") {
    return state;
  }

  const sheepToGather = getNearestLostSheep(state);

  if (!sheepToGather) {
    return state;
  }

  return herdSheepById(state, sheepToGather.id);
}

function getNearestLostSheep(state: GameState): Sheep | undefined {
  const dogPosition = state.dog.position;

  return state.sheep.reduce<Sheep | undefined>((nearest, candidate) => {
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
}

function getFetchPosition(sheep: Sheep): Vector2 {
  return {
    x: sheep.position.x,
    y: sheep.position.y + 1,
  };
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
