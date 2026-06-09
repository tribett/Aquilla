import { BRIARFOLD_SAFE_DOG_POSITION, BRIARFOLD_SAFE_PLAYER_POSITION } from "./hazards";
import type { Creature, GameState, Vector2 } from "./types";

export interface ProwlerStepResult {
  state: GameState;
  message?: string;
}

export interface ProwlerInteractionResult {
  state: GameState;
  message: string;
}

export function advanceProwlers(state: GameState): GameState {
  if (state.currentArea !== "briarfold") return state;

  return {
    ...state,
    creatures: state.creatures.map((creature) => {
      if (creature.kind !== "thorn-prowler" || creature.state !== "hostile") {
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

export function getActiveProwlerAt(
  state: GameState,
  position: Vector2,
): Creature | undefined {
  if (state.currentArea !== "briarfold") return undefined;

  return state.creatures.find(
    (creature) =>
      creature.kind === "thorn-prowler" &&
      creature.state !== "restored" &&
      creature.position.x === position.x &&
      creature.position.y === position.y,
  );
}

export function resolveProwlerStep(
  state: GameState,
  previousPosition: Vector2,
): ProwlerStepResult {
  const prowler = getActiveProwlerAt(state, state.player.position);

  if (!prowler) {
    return { state };
  }

  if (state.dog.command === "distract") {
    return {
      state: setProwlerState(state, prowler.id, "distracted"),
      message: "The sheepdog draws the thorn prowler aside before it can strike.",
    };
  }

  const nextHealth = state.player.health - 1;

  if (nextHealth <= 0) {
    return {
      state: {
        ...state,
        dog: {
          ...state.dog,
          command: "follow",
          position: BRIARFOLD_SAFE_DOG_POSITION,
        },
        player: {
          ...state.player,
          health: state.player.maxHealth,
          position: BRIARFOLD_SAFE_PLAYER_POSITION,
        },
      },
      message: "The thorn prowler overwhelms Aquilla, but grace carries him back to shelter.",
    };
  }

  return {
    state: {
      ...state,
      player: {
        ...state.player,
        health: nextHealth,
        position: previousPosition,
      },
    },
    message: "The thorn prowler lunges from the briars; Aquilla falls back.",
  };
}

export function distractOrRestoreProwler(
  state: GameState,
  creatureId: string,
): ProwlerInteractionResult {
  const prowler = state.creatures.find((creature) => creature.id === creatureId);

  if (!prowler) {
    return {
      state,
      message: "There is no prowler here to answer.",
    };
  }

  if (prowler.state === "restored") {
    return {
      state,
      message: "This thorn prowler is already restored.",
    };
  }

  if (state.dog.command !== "distract" || prowler.state === "hostile") {
    return {
      state: {
        ...setProwlerState(state, prowler.id, "distracted"),
        dog: {
          ...state.dog,
          command: "distract",
        },
      },
      message: "The sheepdog draws the prowler's rage away without biting back.",
    };
  }

  return {
    state: {
      ...setProwlerState(state, prowler.id, "restored"),
      dog: {
        ...state.dog,
        command: "follow",
      },
      objectives: {
        ...state.objectives,
        thornProwlersRestored: state.objectives.thornProwlersRestored + 1,
      },
    },
    message: "The Shepherd's Staff quiets the thorn prowler; the creature is restored to peace.",
  };
}

function setProwlerState(
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
