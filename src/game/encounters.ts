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

  if (
    encounter.kind === "false-light-archon" &&
    action === "staff-calm" &&
    state.dog.command === "distract"
  ) {
    return {
      state: {
        ...state,
        flags: {
          ...state.flags,
          ashenSpireDefeated: true,
        },
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "The False-Light Archon scatters; received light remains.",
    };
  }

  if (
    encounter.id === "lucent-court-sentinel" &&
    action === "staff-calm" &&
    state.dog.command === "distract"
  ) {
    return {
      state: {
        ...state,
        flags: {
          ...state.flags,
          lucentCourtDefeated: true,
        },
        chapter: 5,
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "False unity shatters. The Lucent Court scatters before received light.",
    };
  }

  if (
    encounter.kind === "false-light-sentinel" &&
    encounter.id === "memory-thief" &&
    action === "staff-calm" &&
    state.dog.command === "distract"
  ) {
    return {
      state: {
        ...state,
        flags: {
          ...state.flags,
          memoryThiefDefeated: true,
        },
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "Stolen hymns return to the vault; memory is mercy's treasure again.",
    };
  }

  if (
    encounter.kind === "thorn-beast" &&
    action === "staff-calm" &&
    state.dog.command === "distract"
  ) {
    return {
      state: {
        ...state,
        flags: {
          ...state.flags,
          foldThornBeastCalmed: true,
        },
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "The thorn-tangled beast stills; brambles loosen without bloodshed.",
    };
  }

  if (encounter.kind === "thorn-beast" && action === "staff-stun") {
    return {
      state,
      encounter: {
        ...encounter,
        state: "stunned",
      },
      message: "The Shepherd's Staff steadies the thorn beast without striking it.",
    };
  }

  if (
    encounter.kind === "thorn-beast" &&
    action === "staff-calm" &&
    encounter.state === "stunned"
  ) {
    return {
      state: {
        ...state,
        flags: {
          ...state.flags,
          foldThornBeastCalmed: true,
        },
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "Mercy untangles the thorn beast; the outer fold can breathe again.",
    };
  }

  if (
    action === "staff-calm" &&
    state.dog.command === "distract"
  ) {
    return {
      state: {
        ...state,
        flags: {
          ...state.flags,
          emberSentinelCalmed: true,
        },
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "The fen sentinel bows; false fire yields to living water.",
    };
  }

  if (encounter.kind === "false-light-sentinel" && action === "staff-stun") {
    return {
      state,
      encounter: {
        ...encounter,
        state: "stunned",
      },
      message: "The Shepherd's Staff steadies the false light without striking it.",
    };
  }

  if (
    encounter.kind === "false-light-sentinel" &&
    action === "staff-calm" &&
    encounter.state === "stunned"
  ) {
    const flags = { ...state.flags };

    if (encounter.id === "ember-fen-sentinel") flags.emberSentinelCalmed = true;
    if (encounter.id === "ashen-spire-archon") flags.ashenSpireDefeated = true;
    if (encounter.id === "memory-thief") flags.memoryThiefDefeated = true;
    if (encounter.id === "lucent-court-sentinel") {
      flags.lucentCourtDefeated = true;
    }

    return {
      state: {
        ...state,
        chapter: encounter.id === "lucent-court-sentinel" ? 5 : state.chapter,
        flags,
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "Mercy restores what violence could only frighten.",
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
