import type { GameState, Interactable } from "./types";

export interface StaffInteractionResult {
  state: GameState;
  object: Interactable;
  message: string;
}

export function useStaffOnObject(
  state: GameState,
  object: Interactable,
): StaffInteractionResult {
  if (!state.inventory.includes("shepherd-staff")) {
    return {
      state,
      object,
      message: "Aquilla needs the Shepherd's Staff.",
    };
  }

  if (object.kind === "bell") {
    return {
      state,
      object: { ...object, active: true },
      message: `The ${object.id} rings clear across the pasture.`,
    };
  }

  if (object.kind === "water-channel") {
    return {
      state: {
        ...state,
        objectives: {
          ...state.objectives,
          waterRestored: true,
        },
      },
      object: { ...object, active: true },
      message: "Water returns to the dry channel.",
    };
  }

  return {
    state,
    object: { ...object, active: true },
    message: `The ${object.id} yields to the Shepherd's Staff.`,
  };
}
