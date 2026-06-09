import type { Encounter, EncounterAction, GameState } from "./types";

export interface EncounterResult {
  state: GameState;
  encounter: Encounter;
  message: string;
}

export function resolveEncounter(
  state: GameState,
  encounter: Encounter,
  action: EncounterAction,
): EncounterResult {
  if (encounter.state === "restored") {
    return {
      state,
      encounter,
      message: "The creature is already restored.",
    };
  }

  if (
    encounter.kind === "corrupted-guardian" &&
    action === "staff-calm" &&
    state.dog.command === "distract"
  ) {
    return {
      state: {
        ...state,
        objectives: {
          ...state.objectives,
          guardianCalmed: true,
        },
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "The guardian lowers its head and remembers its charge.",
    };
  }

  if (encounter.kind === "fear-echo" && encounter.state === "stunned" && action === "staff-calm") {
    return {
      state: {
        ...state,
        objectives: {
          ...state.objectives,
          fearEchoCalmed: true,
        },
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "The fear echo releases its borrowed voice and becomes still.",
    };
  }

  if (encounter.kind === "fear-echo" && action === "staff-stun") {
    return {
      state,
      encounter: {
        ...encounter,
        state: "stunned",
      },
      message: "The Shepherd's Staff steadies the fear echo without striking it.",
    };
  }

  if (action === "staff-stun") {
    return {
      state,
      encounter: {
        ...encounter,
        state: "stunned",
      },
      message: "The Shepherd's Staff gives Aquilla a moment to protect the weak.",
    };
  }

  return {
    state,
    encounter,
    message: "The creature resists Aquilla's approach.",
  };
}
