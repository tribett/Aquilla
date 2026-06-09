import type { GameState } from "./types";

export type SanctumStepId = "remember" | "receive" | "return";

export interface SanctumStepResult {
  state: GameState;
  message: string;
}

export const SANCTUM_STEP_ORDER: readonly SanctumStepId[] = ["remember", "receive", "return"];

const SANCTUM_STEP_LABELS: Record<SanctumStepId, string> = {
  receive: "Receive",
  remember: "Remember",
  return: "Return",
};

const SANCTUM_STEP_MESSAGES: Record<SanctumStepId, string> = {
  receive: "Aquilla receives: grace is not earned by courage; it is given in Christ.",
  remember: "Aquilla remembers: the Light came first, and every mercy began as gift.",
  return: "Aquilla returns: the Shepherd has sent restored servants back to love the valley.",
};

export function getNextSanctumStepId(state: GameState): SanctumStepId | undefined {
  return SANCTUM_STEP_ORDER[state.objectives.sanctumWitnessSteps];
}

export function getSanctumStepLabel(stepId: SanctumStepId): string {
  return SANCTUM_STEP_LABELS[stepId];
}

export function completeSanctumStep(
  state: GameState,
  stepId: SanctumStepId,
): SanctumStepResult {
  const stepIndex = SANCTUM_STEP_ORDER.indexOf(stepId);
  const nextStep = getNextSanctumStepId(state);

  if (stepIndex < state.objectives.sanctumWitnessSteps) {
    return {
      state,
      message: `The ${SANCTUM_STEP_LABELS[stepId]} witness is already complete.`,
    };
  }

  if (nextStep !== stepId) {
    const nextLabel = nextStep ? SANCTUM_STEP_LABELS[nextStep] : "last";

    return {
      state,
      message: `The ${SANCTUM_STEP_LABELS[stepId]} witness waits for ${nextLabel}.`,
    };
  }

  const nextCount = state.objectives.sanctumWitnessSteps + 1;
  const complete = nextCount >= state.objectives.requiredSanctumWitnessSteps;

  return {
    state: {
      ...state,
      objectives: {
        ...state.objectives,
        gameComplete: complete,
        sanctumWitnessSteps: nextCount,
      },
    },
    message: SANCTUM_STEP_MESSAGES[stepId],
  };
}
