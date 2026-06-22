import type { Creature, GameState, Vector2 } from "./types";

export interface ShadowWolfStepResult {
  state: GameState;
  message?: string;
}

export interface ShadowWolfInteractionResult {
  state: GameState;
  message: string;
}

export function advanceShadowWolves(state: GameState): GameState {
  if (state.currentArea !== "fold-of-the-lost" || state.currentRoom !== "fold-inner") {
    return state;
  }

  return {
    ...state,
    creatures: state.creatures.map((creature) => {
      if (creature.kind !== "shadow-wolf" || creature.state !== "hostile") {
        return creature;
      }

      const nextPatrolIndex = (creature.patrolIndex + 1) % creature.patrol.length;

      return {
        ...creature,
        patrolIndex: nextPatrolIndex,
        position: creature.patrol[nextPatrolIndex],
      };
    }),
  };
}

export function getActiveShadowWolfAt(
  state: GameState,
  position: Vector2,
): Creature | undefined {
  if (state.currentArea !== "fold-of-the-lost" || state.currentRoom !== "fold-inner") {
    return undefined;
  }

  return state.creatures.find(
    (creature) =>
      creature.kind === "shadow-wolf" &&
      creature.state !== "restored" &&
      creature.position.x === position.x &&
      creature.position.y === position.y,
  );
}

export function resolveShadowWolfStep(
  state: GameState,
  previousPosition: Vector2,
): ShadowWolfStepResult {
  const wolf = getActiveShadowWolfAt(state, state.player.position);

  if (!wolf) {
    return { state };
  }

  if (state.dog.command === "distract") {
    return {
      state: setShadowWolfState(state, wolf.id, "distracted"),
      message: "Bracken warns Aquilla back as the shadowed wolf turns toward the sheepdog.",
    };
  }

  return {
    state: {
      ...state,
      player: {
        ...state.player,
        position: previousPosition,
      },
    },
    message: "A shadowed wolf blocks the inner fold; Bracken bristles at the danger.",
  };
}

export function distractOrRestoreShadowWolf(
  state: GameState,
  creatureId: string,
): ShadowWolfInteractionResult {
  const wolf = state.creatures.find((creature) => creature.id === creatureId);

  if (!wolf || wolf.kind !== "shadow-wolf") {
    return {
      state,
      message: "No shadowed wolf answers here.",
    };
  }

  if (wolf.state === "restored") {
    return {
      state,
      message: "The shadowed wolf already walks in peace.",
    };
  }

  if (state.dog.command !== "distract" || wolf.state === "hostile") {
    return {
      state: {
        ...setShadowWolfState(state, wolf.id, "distracted"),
        dog: {
          ...state.dog,
          command: "distract",
        },
      },
      message: "Bracken draws the shadowed wolf aside without biting back.",
    };
  }

  return {
    state: {
      ...setShadowWolfState(state, wolf.id, "restored"),
      dog: {
        ...state.dog,
        command: "follow",
      },
      flags: {
        ...state.flags,
        foldShadowWolfRestored: true,
      },
    },
    message: "The Shepherd's Staff steadies the shadowed wolf; fear loosens its grip.",
  };
}

function setShadowWolfState(
  state: GameState,
  creatureId: string,
  creatureState: Creature["state"],
): GameState {
  return {
    ...state,
    creatures: state.creatures.map((creature) =>
      creature.id === creatureId
        ? { ...creature, state: creatureState }
        : creature,
    ),
  };
}
