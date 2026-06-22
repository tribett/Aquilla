import { buildBossRoom, buildCorridorRoom, buildShrineRoom } from "./dungeonMapBuilder";

/** Dungeon II — Lantern Ruins (3 rooms) */
export const LANTERN_ANTECHAMBER_MAP = buildCorridorRoom("C");
export const LANTERN_BEACON_HALL_MAP = buildShrineRoom("C", 5);
export const LANTERN_SANCTUM_GATE_MAP = buildShrineRoom("C", 15);

/** Dungeon III — Sanctum of Witness (2 rooms) */
export const SANCTUM_WITNESS_HALL_MAP = buildShrineRoom("C", 5);
export const SANCTUM_THRESHOLD_MAP = buildShrineRoom("C", 15);

/** Dungeon IV — Ember Fen Cistern (3 rooms) */
export const EMBER_CISTERN_ENTRY_MAP = buildCorridorRoom("R");
export const EMBER_CISTERN_CHANNELS_MAP = buildShrineRoom("R", 6);
export const EMBER_CISTERN_HEART_MAP = buildShrineRoom("R", 8);

/** Dungeon V — Ashen Spire (3 rooms) */
export const ASHEN_SPIRE_ENTRY_MAP = buildCorridorRoom("C");
export const ASHEN_SPIRE_ASCENT_MAP = buildShrineRoom("C", 8);
export const ASHEN_SPIRE_APEX_MAP = buildBossRoom("C");

/** Dungeon VI — Monastic Vault (3 rooms) */
export const MONASTIC_CLOISTER_MAP = buildCorridorRoom("C");
export const MONASTIC_NAVE_MAP = buildShrineRoom("C", 5);
export const MONASTIC_CHOIR_MAP = buildShrineRoom("C", 9);

/** Dungeon VII — Kingsroad Undercroft (2 rooms) */
export const UNDERCROFT_ENTRY_MAP = buildCorridorRoom("G");
export const UNDERCROFT_SEAL_MAP = buildShrineRoom("G", 9);

/** Dungeon VIII — Lucent Depths (4 rooms) */
export const CATHEDRAL_NARTHEX_MAP = buildCorridorRoom("C");
export const CATHEDRAL_CHOIR_MAP = buildShrineRoom("C", 6);
export const LUCENT_ANTECHAMBER_MAP = buildShrineRoom("C", 9);
export const LUCENT_THRONE_MAP = buildBossRoom("C");
