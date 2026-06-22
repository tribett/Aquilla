import { enterElarionIfReady, enterKingsroadIfReady } from "./areas";
import { completeEmberFenShrine } from "./emberFen";
import { setFlag } from "./flags";
import type { GameState } from "./types";

export interface EpicInteractionResult {
  message: string;
  state: GameState;
}

export function completeFoldDungeon(state: GameState): EpicInteractionResult {
  if (state.currentArea !== "fold-of-the-lost" || state.currentRoom !== "fold-heart") {
    return { message: "The Fold's heart waits deeper within.", state };
  }

  if (!state.objectives.guardianCalmed) {
    return {
      message: "The corrupted guardian blocks the inner refuge until mercy calms it.",
      state,
    };
  }

  return {
    message: "The Fold breathes again. Briarfold remembers refuge, not fear.",
    state: setFlag(
      {
        ...state,
        currentArea: "briarfold",
        currentRoom: "briarfold-main",
        region: "briarfold-valley",
        dog: {
          ...state.dog,
          command: "follow",
          position: { x: 15, y: 6 },
        },
        objectives: {
          ...state.objectives,
          foldRestored: true,
        },
        player: {
          ...state.player,
          facing: "left",
          position: { x: 16, y: 6 },
        },
      },
      "foldDungeonComplete",
    ),
  };
}

export function interactEmberFenShrine(state: GameState): EpicInteractionResult {
  return completeEmberFenShrine(state);
}

export function claimLanternOfWitness(state: GameState): EpicInteractionResult {
  if (state.currentArea !== "ashen-spire" || state.currentRoom !== "ashen-spire-apex") {
    return { message: "The Lantern of Witness waits at the spire's apex.", state };
  }

  if (!state.flags.emberFenComplete) {
    return { message: "The spire waits until Ember Fen is cleansed.", state };
  }

  if (!state.flags.ashenSpireDefeated) {
    return {
      message: "The False-Light Archon still binds the Lantern of Witness.",
      state,
    };
  }

  if (state.inventory.includes("lantern-of-witness")) {
    return { message: "The Lantern of Witness already walks with Aquilla.", state };
  }

  return {
    message: "Aquilla receives the Lantern of Witness: received light that reveals what is hidden.",
    state: setFlag(
      {
        ...state,
        inventory: [...state.inventory, "lantern-of-witness"],
      },
      "lanternOfWitnessClaimed",
    ),
  };
}

export function interactMonasticRuins(state: GameState): EpicInteractionResult {
  return {
    message: "Sing faith, hope, and love at the three hymn stones.",
    state,
  };
}

export function claimHarpOfRemembrance(state: GameState): EpicInteractionResult {
  return {
    message: "Play the harp melody with keys 1 through 5 in order.",
    state,
  };
}

export function interactForgottenCathedral(state: GameState): EpicInteractionResult {
  return {
    message: "Offer praise, confession, and sending at the cathedral stones.",
    state,
  };
}

export function defeatLucentCourt(state: GameState): EpicInteractionResult {
  if (state.currentArea !== "lucent-sanctum" || !state.flags.cathedralComplete) {
    return { message: "False light still binds the deep sanctum.", state };
  }

  if (!state.flags.lucentCourtDefeated) {
    return {
      message: "The Lucent Court sentinel must be calmed before false unity breaks.",
      state,
    };
  }

  return {
    message: "False unity shatters. Return to Briarfold for the Crown Witness.",
    state,
  };
}

export function unlockAshenMoor(state: GameState): GameState {
  if (!state.objectives.storyComplete) return state;

  return setFlag(
    {
      ...state,
      chapter: 2,
      flags: { ...state.flags, ashenMoorUnlocked: true },
    },
    "ashenMoorUnlocked",
  );
}

export function unlockKingsroad(state: GameState): GameState {
  if (!state.flags.lanternOfWitnessClaimed) return state;

  return enterKingsroadIfReady({
    ...state,
    flags: { ...state.flags, kingsroadUnlocked: true },
  });
}

export function unlockElarion(state: GameState): GameState {
  if (!state.flags.harpOfRemembranceClaimed) return state;

  return enterElarionIfReady({
    ...state,
    flags: { ...state.flags, elarionUnlocked: true },
  });
}
