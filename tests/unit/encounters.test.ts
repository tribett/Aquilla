import { describe, expect, it } from "vitest";
import { commandDog } from "../../src/game/dog";
import { createInitialState } from "../../src/game/createInitialState";
import { resolveEncounter } from "../../src/game/encounters";
import type { Encounter } from "../../src/game/types";

describe("resolveEncounter", () => {
  it("calms a corrupted guardian through distraction and staff restraint", () => {
    const guardian: Encounter = {
      id: "fold-guardian",
      kind: "corrupted-guardian",
      state: "hostile",
    };
    const state = commandDog(createInitialState(), "distract");

    const result = resolveEncounter(state, guardian, "staff-calm");

    expect(result.encounter.state).toBe("restored");
    expect(result.state.objectives.guardianCalmed).toBe(true);
    expect(result.message).toBe("The guardian lowers its head and remembers its charge.");
  });
});
