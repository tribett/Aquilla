import { describe, expect, it } from "vitest";
import { returnToBriarfoldFromSanctum } from "../../src/game/areas";
import { createInitialState } from "../../src/game/createInitialState";
import { completeSanctumStep } from "../../src/game/sanctum";
import { canReturnHomeFromSanctum, canWitnessFinale, completeStory } from "../../src/game/ending";

describe("story ending", () => {
  it("returns home from the Sanctum after the witness is complete", () => {
    const sanctumState = {
      ...createInitialState(),
      currentArea: "sanctum" as const,
      objectives: {
        ...createInitialState().objectives,
        gameComplete: true,
        introSeen: true,
        lanternRuinsRestored: true,
        sanctumWitnessSteps: 3,
      },
    };

    expect(canReturnHomeFromSanctum(sanctumState)).toBe(true);

    const returned = returnToBriarfoldFromSanctum(sanctumState);

    expect(returned.currentArea).toBe("briarfold");
    expect(returned.objectives.returnedHome).toBe(true);
    expect(canWitnessFinale(returned)).toBe(true);
  });

  it("closes the story after Aquilla speaks with Elder Mara at home", () => {
    const homeState = {
      ...createInitialState(),
      currentArea: "briarfold" as const,
      objectives: {
        ...createInitialState().objectives,
        gameComplete: true,
        introSeen: true,
        returnedHome: true,
        sanctumWitnessSteps: 3,
      },
    };

    const finale = completeStory(homeState);

    expect(finale.state.objectives.storyComplete).toBe(true);
    expect(finale.message).toContain("sent");
  });

  it("marks the game complete only after the final Sanctum step", () => {
    const initialState = createInitialState();
    const remember = completeSanctumStep(initialState, "remember");
    const receive = completeSanctumStep(remember.state, "receive");
    const returned = completeSanctumStep(receive.state, "return");

    expect(returned.state.objectives.gameComplete).toBe(true);
    expect(returned.state.objectives.storyComplete).toBe(false);
    expect(returned.state.objectives.returnedHome).toBe(false);
  });
});
