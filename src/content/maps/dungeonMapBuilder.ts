/** Procedural 20×13 dungeon room templates (Zelda-readable corridors). */

const W = "TTTTTTTTTTTTTTTTTTTT";
const B = "TBBBBBBBBBBBBBBBBBBT";

function row(inner: string): string {
  return `T${inner}T`;
}

export function buildCorridorRoom(floor: "G" | "C" | "R" = "G"): readonly string[] {
  const p = floor === "C" ? "C" : floor === "R" ? "R" : "G";
  return [
    W,
    B,
    row(`${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}`),
    row(`${p}PPPPPPPPPPPPPPPP${p}`),
    row(`${p}P${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}P${p}`),
    row(`${p}P${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}P${p}`),
    row(`${p}P${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}P${p}`),
    row(`${p}P${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}P${p}`),
    row(`${p}P${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}P${p}`),
    row(`${p}PPPPPPPPPPPPPPPP${p}`),
    row(`${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}${p}`),
    B,
    W,
  ];
}

export function buildShrineRoom(floor: "G" | "C" | "R" = "G", altarX = 8): readonly string[] {
  const base = buildCorridorRoom(floor);
  const altarRow = 5;
  const inner = base[altarRow + 1];
  const chars = inner.slice(1, -1).split("");
  chars[altarX] = "A";
  if (altarX > 0) chars[altarX - 1] = "L";
  if (altarX < chars.length - 1) chars[altarX + 1] = "L";
  return [
    ...base.slice(0, altarRow + 1),
    `T${chars.join("")}T`,
    ...base.slice(altarRow + 2),
  ];
}

export function buildBossRoom(floor: "C" | "R" = "C"): readonly string[] {
  return buildShrineRoom(floor, 9);
}
