import { describe, expect, it } from "vitest";

describe("app shell contract", () => {
  it("uses the Aquilla browser mount point", async () => {
    const html = await import("node:fs/promises").then((fs) =>
      fs.readFile("index.html", "utf8"),
    );

    expect(html).toContain('<div id="game-root"');
    expect(html).toContain('<div id="map-panel"');
    expect(html).toContain("M map");
    expect(html).toContain("/src/main.ts");
  });
});
