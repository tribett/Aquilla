import { describe, expect, it, vi } from "vitest";
import { AQUILLA_ART, type PixelAsset } from "../../src/art/aquillaArt";
import { drawPixelAsset, drawTileScene } from "../../src/art/pixelRenderer";

const TRANSPARENT_GLYPHS = new Set([".", " "]);

function namedEntries(
  prefix: string,
  assets: Readonly<Record<string, PixelAsset>>,
): Array<[string, PixelAsset]> {
  return Object.entries(assets).map(([name, asset]) => [`${prefix}:${name}`, asset]);
}

function allNamedAssets(): Array<[string, PixelAsset]> {
  return [
    ...namedEntries("tile", AQUILLA_ART.tiles),
    ...namedEntries("sprite", AQUILLA_ART.sprites),
    ...namedEntries("icon", AQUILLA_ART.icons),
  ];
}

function graphicsStub(): Parameters<typeof drawPixelAsset>[0] {
  return {
    fillRect: vi.fn(),
    fillStyle: vi.fn(),
  } as unknown as Parameters<typeof drawPixelAsset>[0];
}

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

  it("uses only palette-backed glyphs in every pixel asset", () => {
    const unknownGlyphs = allNamedAssets().flatMap(([assetName, asset]) =>
      asset.rows.flatMap((row, rowIndex) =>
        [...row].flatMap((glyph, columnIndex) =>
          TRANSPARENT_GLYPHS.has(glyph) || asset.palette[glyph]
            ? []
            : [`${assetName}:${rowIndex}:${columnIndex}:${glyph}`],
        ),
      ),
    );

    expect(unknownGlyphs).toEqual([]);
  });

  it("uses only registered tile characters in the scene map", () => {
    const tiles: Readonly<Record<string, PixelAsset>> = AQUILLA_ART.tiles;
    const unknownTiles = AQUILLA_ART.sceneMap.flatMap((row, rowIndex) =>
      [...row].flatMap((tileChar, columnIndex) =>
        tiles[tileChar]
          ? []
          : [`scene:${rowIndex}:${columnIndex}:${tileChar}`],
      ),
    );

    expect(unknownTiles).toEqual([]);
  });

  it("rejects pixel assets with glyphs missing from their palette", () => {
    const brokenAsset: PixelAsset = {
      palette: { x: "#000000" },
      rows: ["x?"],
    };

    expect(() => drawPixelAsset(graphicsStub(), brokenAsset, 0, 0, 1)).toThrow(
      'Unknown pixel glyph "?" at row 0, column 1',
    );
  });

  it("rejects scene map tile characters missing from the tile registry", () => {
    const grass: PixelAsset = {
      palette: { g: "#00ff00" },
      rows: ["g"],
    };

    expect(() => drawTileScene(graphicsStub(), ["G?"], { G: grass }, 0, 0, 1)).toThrow(
      'Unknown scene tile "?" at row 0, column 1',
    );
  });
});
