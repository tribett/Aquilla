import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { completeSanctumStep } from "../../src/game/sanctum";

describe("sanctum ending", () => {
  it("completes remember, receive, and return in order", () => {
    const initialState = createInitialState();

    const prematureReceive = completeSanctumStep(initialState, "receive");

    expect(prematureReceive.state).toBe(initialState);
    expect(prematureReceive.message).toContain("Remember");

    const remember = completeSanctumStep(initialState, "remember");

    expect(remember.state.objectives.sanctumWitnessSteps).toBe(1);
    expect(remember.state.objectives.gameComplete).toBe(false);
    expect(remember.message).toContain("gift");

    const repeatedRemember = completeSanctumStep(remember.state, "remember");

    expect(repeatedRemember.state.objectives.sanctumWitnessSteps).toBe(1);
    expect(repeatedRemember.message).toContain("already");

    const receive = completeSanctumStep(remember.state, "receive");

    expect(receive.state.objectives.sanctumWitnessSteps).toBe(2);
    expect(receive.state.objectives.gameComplete).toBe(false);
    expect(receive.message).toContain("Christ");

    const returned = completeSanctumStep(receive.state, "return");

    expect(returned.state.objectives.sanctumWitnessSteps).toBe(3);
    expect(returned.state.objectives.gameComplete).toBe(true);
    expect(returned.message).toContain("sent");
  });
});
