import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { lightCreedBeacon } from "../../src/game/creedBeacons";

describe("creed beacons", () => {
  it("lights the Maker, Redeemer, and Giver beacons in creed order", () => {
    const initialState = createInitialState();

    const prematureRedeemer = lightCreedBeacon(initialState, "redeemer");

    expect(prematureRedeemer.state).toBe(initialState);
    expect(prematureRedeemer.message).toContain("Maker");

    const maker = lightCreedBeacon(initialState, "maker");

    expect(maker.state.objectives.creedBeaconsLit).toBe(1);
    expect(maker.state.objectives.lanternRuinsRestored).toBe(false);
    expect(maker.message).toContain("Father");

    const repeatedMaker = lightCreedBeacon(maker.state, "maker");

    expect(repeatedMaker.state.objectives.creedBeaconsLit).toBe(1);
    expect(repeatedMaker.message).toContain("already lit");

    const redeemer = lightCreedBeacon(maker.state, "redeemer");

    expect(redeemer.state.objectives.creedBeaconsLit).toBe(2);
    expect(redeemer.state.objectives.lanternRuinsRestored).toBe(false);
    expect(redeemer.message).toContain("Son");

    const giver = lightCreedBeacon(redeemer.state, "giver");

    expect(giver.state.objectives.creedBeaconsLit).toBe(3);
    expect(giver.state.objectives.lanternRuinsRestored).toBe(true);
    expect(giver.message).toContain("Spirit");
  });
});
