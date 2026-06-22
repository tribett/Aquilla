import { getActiveShadowWolfAt } from "./shadowWolves";
import { getActiveProwlerAt } from "./prowlers";
import type { DogCommand, GameState, Sheep, Vector2 } from "./types";

function distanceBetween(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function getThreatWarning(state: GameState): string | undefined {
  const playerPosition = state.player.position;
  const nearbyRange = 2.5;

  const prowler = state.creatures.find(
    (creature) =>
      creature.kind === "thorn-prowler" &&
      creature.state === "hostile" &&
      distanceBetween(creature.position, playerPosition) <= nearbyRange,
  );

  if (prowler) {
    return "Bracken whines low — a thorn prowler hunts nearby.";
  }

  const wolf = state.creatures.find(
    (creature) =>
      creature.kind === "shadow-wolf" &&
      creature.state === "hostile" &&
      distanceBetween(creature.position, playerPosition) <= nearbyRange,
  );

  if (wolf) {
    return "Bracken bristles — a shadowed wolf stalks the fold.";
  }

  if (
    state.currentArea === "fold-of-the-lost" &&
    state.currentRoom === "fold-entrance" &&
    !state.flags.foldThornBeastCalmed
  ) {
    return "Bracken growls — thorn-tangled movement blocks the outer fold.";
  }

  if (getActiveProwlerAt(state, playerPosition)) {
    return "Bracken warns Aquilla back from the thorn prowler.";
  }

  if (getActiveShadowWolfAt(state, playerPosition)) {
    return "Bracken warns Aquilla back from the shadowed wolf.";
  }

  return undefined;
}

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
