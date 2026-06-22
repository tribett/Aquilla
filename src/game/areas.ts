import { getDefaultRoomForArea } from "../content/worldRegistry";
import { enterRoom } from "./rooms";
import type { GameState } from "./types";

export const OLD_PASTURE_START = { x: 2, y: 6 };
export const OLD_PASTURE_DOG_START = { x: 1, y: 6 };
export const LANTERN_RUINS_START = { x: 2, y: 9 };
export const LANTERN_RUINS_DOG_START = { x: 1, y: 9 };
export const SANCTUM_START = { x: 2, y: 9 };
export const SANCTUM_DOG_START = { x: 1, y: 9 };
export const BRIARFOLD_HOME_START = { x: 5, y: 5 };
export const BRIARFOLD_HOME_DOG_START = { x: 4, y: 5 };

function transitionToArea(state: GameState, areaId: GameState["currentArea"]): GameState {
  const room = getDefaultRoomForArea(areaId);

  return {
    ...state,
    currentArea: areaId,
    currentRoom: room.id,
    region: room.regionId,
    dog: {
      ...state.dog,
      command: "follow",
      position: OLD_PASTURE_DOG_START,
    },
    player: {
      ...state.player,
      facing: "right",
      position: OLD_PASTURE_START,
    },
  };
}

export function enterFoldDungeonIfReady(state: GameState): GameState {
  if (!state.objectives.foldBellRung || state.currentArea !== "briarfold") {
    return state;
  }

  return transitionToArea(
    {
      ...state,
      flags: { ...state.flags, foldDungeonEntered: true },
    },
    "fold-of-the-lost",
  );
}

export function enterOldPastureIfReady(state: GameState): GameState {
  if (!state.objectives.foldRestored || state.currentArea === "old-pasture") {
    return state;
  }

  return transitionToArea(state, "old-pasture");
}

export function enterLanternRuinsIfReady(state: GameState): GameState {
  if (
    !state.objectives.fearEchoCalmed ||
    state.currentArea !== "old-pasture" ||
    !state.inventory.includes("grove-lantern")
  ) {
    return state;
  }

  const next = enterRoom(state, "lantern-beacon-hall", {
    dog: LANTERN_RUINS_DOG_START,
    player: LANTERN_RUINS_START,
  });

  return {
    ...next,
    player: {
      ...next.player,
      facing: "right",
    },
  };
}

export function enterSanctumIfReady(state: GameState): GameState {
  if (!state.objectives.lanternRuinsRestored || state.currentArea !== "lantern-ruins") {
    return state;
  }

  const next = enterRoom(state, "sanctum-witness-hall", {
    dog: SANCTUM_DOG_START,
    player: SANCTUM_START,
  });

  return {
    ...next,
    player: {
      ...next.player,
      facing: "right",
    },
  };
}

export function returnToBriarfoldFromSanctum(state: GameState): GameState {
  if (!state.objectives.gameComplete || state.currentArea !== "sanctum") {
    return state;
  }

  return {
    ...state,
    currentArea: "briarfold",
    currentRoom: "briarfold-main",
    region: "briarfold-valley",
    dog: {
      ...state.dog,
      command: "follow",
      position: BRIARFOLD_HOME_DOG_START,
    },
    objectives: {
      ...state.objectives,
      returnedHome: true,
    },
    player: {
      ...state.player,
      facing: "left",
      position: BRIARFOLD_HOME_START,
    },
  };
}

export function returnToBriarfoldForCrownWitness(state: GameState): GameState {
  if (!state.flags.lucentCourtDefeated || state.currentArea !== "lucent-sanctum") {
    return state;
  }

  return {
    ...state,
    chapter: 5,
    currentArea: "briarfold",
    currentRoom: "briarfold-main",
    region: "briarfold-valley",
    dog: {
      ...state.dog,
      command: "follow",
      position: BRIARFOLD_HOME_DOG_START,
    },
    player: {
      ...state.player,
      facing: "left",
      position: BRIARFOLD_HOME_START,
    },
  };
}

export function enterAshfordIfReady(state: GameState): GameState {
  if (!state.flags.ashenMoorUnlocked || state.region === "ashen-moor") {
    return state;
  }

  return transitionToArea(
    {
      ...state,
      chapter: 2,
      flags: { ...state.flags, ashenMoorUnlocked: true },
    },
    "ashford-crossing",
  );
}

export function enterKingsroadIfReady(state: GameState): GameState {
  if (!state.flags.kingsroadUnlocked || state.region === "high-kingsroad") {
    return state;
  }

  return transitionToArea(
    {
      ...state,
      chapter: 3,
      flags: { ...state.flags, kingsroadUnlocked: true },
    },
    "kingsroad-pass",
  );
}

export function enterElarionIfReady(state: GameState): GameState {
  if (!state.flags.elarionUnlocked || state.region === "elarion") {
    return state;
  }

  return transitionToArea(
    {
      ...state,
      chapter: 4,
      flags: { ...state.flags, elarionUnlocked: true },
    },
    "elarion-gate",
  );
}
