import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { commandDog, herdNearestSheep } from "../../src/game/dog";

describe("dog commands", () => {
  it("sets the sheepdog command", () => {
    const state = createInitialState();

    const next = commandDog(state, "stay");

    expect(next.dog.command).toBe("stay");
  });

  it("gathers the nearest lost sheep when commanded to herd", () => {
    const state = commandDog(createInitialState(), "herd");

    const next = herdNearestSheep(state);

    expect(next.objectives.gatheredSheep).toBe(1);
    expect(next.sheep.filter((sheep) => sheep.gathered)).toHaveLength(1);
  });
});
