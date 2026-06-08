import { describe, expect, it } from "vitest";
import { AQUILLA_ART } from "../../src/art/aquillaArt";

describe("Aquilla art bible assets", () => {
  it("locks the Greenward art direction and light palette", () => {
    expect(AQUILLA_ART.direction.world).toBe("Greenward");
    expect(AQUILLA_ART.direction.pixelStyle).toContain("Minish Cap");
    expect(AQUILLA_ART.palette.trueLight).toBe("#e0a93a");
    expect(AQUILLA_ART.palette.trueLightHighlight).toBe("#f6d97a");
    expect(AQUILLA_ART.palette.falseLight).toBe("#b6ecc8");
    expect(AQUILLA_ART.palette.falseLightFringe).toBe("#c4abe0");
    expect(AQUILLA_ART.palette.warmOutline).toBe("#241a12");
  });

  it("uses 16x16 overworld tiles and a 16x24 Aquilla sprite", () => {
    for (const tile of Object.values(AQUILLA_ART.tiles)) {
      expect(tile.rows).toHaveLength(16);
      expect(tile.rows.every((row) => row.length === 16)).toBe(true);
    }

    expect(AQUILLA_ART.sprites.aquilla.rows).toHaveLength(24);
    expect(AQUILLA_ART.sprites.aquilla.rows.every((row) => row.length === 16)).toBe(true);
    expect(AQUILLA_ART.sceneMap).toHaveLength(13);
    expect(AQUILLA_ART.sceneMap.every((row) => row.length === 20)).toBe(true);
  });
});
