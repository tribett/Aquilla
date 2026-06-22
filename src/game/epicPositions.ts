import type { AreaId, Vector2 } from "./types";

export const ASHFORD_GUIDE_POSITION: Vector2 = { x: 9, y: 12 };
export const EMBER_FEN_SHRINE_POSITION: Vector2 = { x: 8, y: 9 };
export const ASHEN_SPIRE_LANTERN_POSITION: Vector2 = { x: 9, y: 9 };
export const KINGSROAD_WAYMARK_POSITION: Vector2 = { x: 9, y: 9 };
export const MONASTIC_HARP_POSITION: Vector2 = { x: 9, y: 9 };
export const CATHEDRAL_SHRINE_POSITION: Vector2 = { x: 9, y: 9 };
export const LUCENT_COURT_BOSS_POSITION: Vector2 = { x: 9, y: 9 };
export const ELARION_INSCRIPTION_POSITION: Vector2 = { x: 9, y: 9 };
export const LUCENT_THRONE_WAYMARK_POSITION: Vector2 = { x: 9, y: 9 };

export const EMBER_CHANNEL_POSITIONS = {
  center: { x: 8, y: 9 },
  north: { x: 6, y: 9 },
  south: { x: 10, y: 9 },
} as const;

export const MONASTIC_HYMN_POSITIONS = {
  faith: { x: 5, y: 9 },
  hope: { x: 9, y: 9 },
  love: { x: 13, y: 9 },
} as const;

export const CATHEDRAL_WORSHIP_POSITIONS = {
  praise: { x: 6, y: 9 },
  confession: { x: 9, y: 9 },
  sending: { x: 12, y: 9 },
} as const;

export function getAreaShrinePosition(area: AreaId): Vector2 | undefined {
  switch (area) {
    case "ember-fen":
      return EMBER_FEN_SHRINE_POSITION;
    case "ashen-spire":
      return ASHEN_SPIRE_LANTERN_POSITION;
    case "monastic-ruins":
      return MONASTIC_HARP_POSITION;
    case "forgotten-cathedral":
      return CATHEDRAL_SHRINE_POSITION;
    case "lucent-sanctum":
      return LUCENT_COURT_BOSS_POSITION;
    default:
      return undefined;
  }
}
