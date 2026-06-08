import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";

describe("createInitialState", () => {
  it("starts Aquilla as a shepherd boy in Briarfold with staff and sheepdog", () => {
    const state = createInitialState();

    expect(state.region).toBe("briarfold-valley");
    expect(state.currentArea).toBe("briarfold");
    expect(state.player.name).toBe("Aquilla");
    expect(state.player.role).toBe("shepherd-boy");
    expect(state.inventory).toContain("shepherd-staff");
    expect(state.dog.style).toBe("border-collie");
    expect(state.objectives).toEqual({
      gatheredSheep: 0,
      requiredSheep: 3,
      waterRestored: false,
      guardianCalmed: false,
      foldRestored: false,
    });
  });
});
