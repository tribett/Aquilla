import { describe, expect, it } from "vitest";
import { AQUILLA_ART } from "../../src/art/aquillaArt";
import { createInitialState } from "../../src/game/createInitialState";
import { buildWorldMapFromScene } from "../../src/render/worldMap";

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
      creedBeaconsLit: 0,
      fearEchoCalmed: false,
      foldRestored: false,
      gameComplete: false,
      gatheredSheep: 0,
      guardianCalmed: false,
      lanternRuinsRestored: false,
      requiredCreedBeacons: 3,
      requiredSanctumWitnessSteps: 3,
      requiredSheep: 3,
      sanctumWitnessSteps: 0,
      waterRestored: false,
    });
  });

  it("places lost sheep on walkable art-map tiles", () => {
    const state = createInitialState();
    const worldMap = buildWorldMapFromScene(AQUILLA_ART.sceneMap);

    state.sheep.forEach((sheep) => {
      expect(worldMap.blockedTiles).not.toContainEqual(sheep.position);
    });
  });
});
