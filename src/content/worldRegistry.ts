import { AQUILLA_ART } from "../art/aquillaArt";
import {
  ASHEN_SPIRE_ASCENT_MAP,
  ASHEN_SPIRE_APEX_MAP,
  ASHEN_SPIRE_ENTRY_MAP,
  CATHEDRAL_CHOIR_MAP,
  CATHEDRAL_NARTHEX_MAP,
  EMBER_CISTERN_CHANNELS_MAP,
  EMBER_CISTERN_ENTRY_MAP,
  EMBER_CISTERN_HEART_MAP,
  LANTERN_ANTECHAMBER_MAP,
  LANTERN_BEACON_HALL_MAP,
  LANTERN_SANCTUM_GATE_MAP,
  LUCENT_ANTECHAMBER_MAP,
  LUCENT_THRONE_MAP,
  MONASTIC_CHOIR_MAP,
  MONASTIC_CLOISTER_MAP,
  MONASTIC_NAVE_MAP,
  SANCTUM_THRESHOLD_MAP,
  SANCTUM_WITNESS_HALL_MAP,
  UNDERCROFT_ENTRY_MAP,
  UNDERCROFT_SEAL_MAP,
} from "./maps/dungeonMaps";
import {
  ASHFORD_CROSSING_MAP,
  ELARION_GATE_MAP,
  FOLD_ENTRANCE_MAP,
  FOLD_HEART_MAP,
  FOLD_INNER_MAP,
  KINGSROAD_PASS_MAP,
} from "./maps/epicMaps";
import type { AreaDefinition, RegionDefinition, RoomDefinition } from "./worldTypes";

const spawn = (x: number, y: number) => ({
  player: { x, y },
  dog: { x: x - 1, y },
});

export const ROOMS: Record<string, RoomDefinition> = {
  "briarfold-main": {
    areaId: "briarfold",
    id: "briarfold-main",
    label: "Briarfold",
    regionId: "briarfold-valley",
    sceneMap: AQUILLA_ART.sceneMap,
    transitions: [
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "fold-of-the-lost",
        targetRoom: "fold-entrance",
        when: (state) => state.objectives.foldBellRung,
      },
    ],
  },
  "fold-entrance": {
    areaId: "fold-of-the-lost",
    id: "fold-entrance",
    label: "Fold — Outer Gate",
    regionId: "briarfold-valley",
    sceneMap: FOLD_ENTRANCE_MAP,
    transitions: [
      { direction: "left", spawn: spawn(16, 6), targetArea: "briarfold", targetRoom: "briarfold-main" },
      { direction: "right", spawn: spawn(2, 6), targetArea: "fold-of-the-lost", targetRoom: "fold-inner" },
    ],
  },
  "fold-inner": {
    areaId: "fold-of-the-lost",
    id: "fold-inner",
    label: "Fold — Inner Pen",
    regionId: "briarfold-valley",
    sceneMap: FOLD_INNER_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "fold-of-the-lost", targetRoom: "fold-entrance" },
      { direction: "right", spawn: spawn(2, 6), targetArea: "fold-of-the-lost", targetRoom: "fold-heart" },
    ],
  },
  "fold-heart": {
    areaId: "fold-of-the-lost",
    id: "fold-heart",
    label: "Fold — Heart",
    regionId: "briarfold-valley",
    sceneMap: FOLD_HEART_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "fold-of-the-lost", targetRoom: "fold-inner" },
    ],
  },
  "old-pasture-main": {
    areaId: "old-pasture",
    id: "old-pasture-main",
    label: "Old Pasture",
    regionId: "briarfold-valley",
    sceneMap: AQUILLA_ART.oldPastureSceneMap,
    transitions: [],
  },
  "lantern-antechamber": {
    areaId: "lantern-ruins",
    id: "lantern-antechamber",
    label: "Lantern Ruins — Antechamber",
    regionId: "briarfold-valley",
    sceneMap: LANTERN_ANTECHAMBER_MAP,
    transitions: [
      { direction: "right", spawn: spawn(2, 9), targetArea: "lantern-ruins", targetRoom: "lantern-beacon-hall" },
    ],
  },
  "lantern-beacon-hall": {
    areaId: "lantern-ruins",
    id: "lantern-beacon-hall",
    label: "Lantern Ruins — Beacon Hall",
    regionId: "briarfold-valley",
    sceneMap: LANTERN_BEACON_HALL_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 9), targetArea: "lantern-ruins", targetRoom: "lantern-antechamber" },
    ],
  },
  "lantern-sanctum-gate": {
    areaId: "lantern-ruins",
    id: "lantern-sanctum-gate",
    label: "Lantern Ruins — Sanctum Gate",
    regionId: "briarfold-valley",
    sceneMap: LANTERN_SANCTUM_GATE_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 9), targetArea: "lantern-ruins", targetRoom: "lantern-beacon-hall" },
    ],
  },
  "sanctum-witness-hall": {
    areaId: "sanctum",
    id: "sanctum-witness-hall",
    label: "Sanctum — Witness Hall",
    regionId: "briarfold-valley",
    sceneMap: SANCTUM_WITNESS_HALL_MAP,
    transitions: [
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "sanctum",
        targetRoom: "sanctum-threshold",
        when: (state) => state.objectives.sanctumWitnessSteps >= 2,
      },
    ],
  },
  "sanctum-threshold": {
    areaId: "sanctum",
    id: "sanctum-threshold",
    label: "Sanctum — Threshold",
    regionId: "briarfold-valley",
    sceneMap: SANCTUM_THRESHOLD_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "sanctum", targetRoom: "sanctum-witness-hall" },
    ],
  },
  "ashford-main": {
    areaId: "ashford-crossing",
    id: "ashford-main",
    label: "Ashford Crossing",
    regionId: "ashen-moor",
    sceneMap: ASHFORD_CROSSING_MAP,
    transitions: [
      { direction: "right", spawn: spawn(2, 6), targetArea: "ember-fen", targetRoom: "ember-cistern-entry" },
    ],
  },
  "ember-cistern-entry": {
    areaId: "ember-fen",
    id: "ember-cistern-entry",
    label: "Ember Fen — Cistern Entry",
    regionId: "ashen-moor",
    sceneMap: EMBER_CISTERN_ENTRY_MAP,
    transitions: [
      { direction: "left", spawn: spawn(16, 6), targetArea: "ashford-crossing", targetRoom: "ashford-main" },
      { direction: "right", spawn: spawn(2, 6), targetArea: "ember-fen", targetRoom: "ember-cistern-channels" },
    ],
  },
  "ember-cistern-channels": {
    areaId: "ember-fen",
    id: "ember-cistern-channels",
    label: "Ember Fen — Channels",
    regionId: "ashen-moor",
    sceneMap: EMBER_CISTERN_CHANNELS_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "ember-fen", targetRoom: "ember-cistern-entry" },
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "ember-fen",
        targetRoom: "ember-cistern-heart",
        when: (state) => Boolean(state.flags.emberChannelNorth && state.flags.emberChannelCenter && state.flags.emberChannelSouth),
      },
    ],
  },
  "ember-cistern-heart": {
    areaId: "ember-fen",
    id: "ember-cistern-heart",
    label: "Ember Fen — Heart Shrine",
    regionId: "ashen-moor",
    sceneMap: EMBER_CISTERN_HEART_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "ember-fen", targetRoom: "ember-cistern-channels" },
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "ashen-spire",
        targetRoom: "ashen-spire-entry",
        when: (state) => Boolean(state.flags.emberFenComplete),
      },
    ],
  },
  "ashen-spire-entry": {
    areaId: "ashen-spire",
    id: "ashen-spire-entry",
    label: "Ashen Spire — Entry",
    regionId: "ashen-moor",
    sceneMap: ASHEN_SPIRE_ENTRY_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "ember-fen", targetRoom: "ember-cistern-heart" },
      { direction: "right", spawn: spawn(2, 6), targetArea: "ashen-spire", targetRoom: "ashen-spire-ascent" },
    ],
  },
  "ashen-spire-ascent": {
    areaId: "ashen-spire",
    id: "ashen-spire-ascent",
    label: "Ashen Spire — Ascent",
    regionId: "ashen-moor",
    sceneMap: ASHEN_SPIRE_ASCENT_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "ashen-spire", targetRoom: "ashen-spire-entry" },
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "ashen-spire",
        targetRoom: "ashen-spire-apex",
        when: (state) => Boolean(state.flags.ashenSpireDefeated),
      },
    ],
  },
  "ashen-spire-apex": {
    areaId: "ashen-spire",
    id: "ashen-spire-apex",
    label: "Ashen Spire — Apex",
    regionId: "ashen-moor",
    sceneMap: ASHEN_SPIRE_APEX_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "ashen-spire", targetRoom: "ashen-spire-ascent" },
    ],
  },
  "kingsroad-main": {
    areaId: "kingsroad-pass",
    id: "kingsroad-main",
    label: "High Kingsroad",
    regionId: "high-kingsroad",
    sceneMap: KINGSROAD_PASS_MAP,
    transitions: [
      {
        direction: "down",
        spawn: spawn(9, 2),
        targetArea: "kingsroad-pass",
        targetRoom: "undercroft-entry",
        when: (state) => Boolean(state.flags.lanternOfWitnessClaimed),
      },
      { direction: "right", spawn: spawn(2, 6), targetArea: "monastic-ruins", targetRoom: "monastic-cloister" },
    ],
  },
  "undercroft-entry": {
    areaId: "kingsroad-pass",
    id: "undercroft-entry",
    label: "Kingsroad Undercroft — Entry",
    regionId: "high-kingsroad",
    sceneMap: UNDERCROFT_ENTRY_MAP,
    transitions: [
      { direction: "up", spawn: spawn(9, 10), targetArea: "kingsroad-pass", targetRoom: "kingsroad-main" },
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "kingsroad-pass",
        targetRoom: "undercroft-seal",
        when: (state) => {
          const snares = state.hazards.filter((h) => h.id.startsWith("kingsroad-snare"));
          return snares.length >= 3 && snares.every((h) => !h.active);
        },
      },
    ],
  },
  "undercroft-seal": {
    areaId: "kingsroad-pass",
    id: "undercroft-seal",
    label: "Kingsroad Undercroft — Seal",
    regionId: "high-kingsroad",
    sceneMap: UNDERCROFT_SEAL_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "kingsroad-pass", targetRoom: "undercroft-entry" },
    ],
  },
  "monastic-cloister": {
    areaId: "monastic-ruins",
    id: "monastic-cloister",
    label: "Monastic Vault — Cloister",
    regionId: "high-kingsroad",
    sceneMap: MONASTIC_CLOISTER_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "kingsroad-pass", targetRoom: "kingsroad-main" },
      { direction: "right", spawn: spawn(2, 6), targetArea: "monastic-ruins", targetRoom: "monastic-nave" },
    ],
  },
  "monastic-nave": {
    areaId: "monastic-ruins",
    id: "monastic-nave",
    label: "Monastic Vault — Nave",
    regionId: "high-kingsroad",
    sceneMap: MONASTIC_NAVE_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "monastic-ruins", targetRoom: "monastic-cloister" },
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "monastic-ruins",
        targetRoom: "monastic-choir",
        when: (state) => Boolean(state.flags.monasticRuinsComplete),
      },
    ],
  },
  "monastic-choir": {
    areaId: "monastic-ruins",
    id: "monastic-choir",
    label: "Monastic Vault — Choir",
    regionId: "high-kingsroad",
    sceneMap: MONASTIC_CHOIR_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "monastic-ruins", targetRoom: "monastic-nave" },
    ],
  },
  "elarion-gate-main": {
    areaId: "elarion-gate",
    id: "elarion-gate-main",
    label: "Elarion Gate",
    regionId: "elarion",
    sceneMap: ELARION_GATE_MAP,
    transitions: [
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "forgotten-cathedral",
        targetRoom: "cathedral-narthex",
        when: (state) => Boolean(state.flags.harpOfRemembranceClaimed),
      },
    ],
  },
  "cathedral-narthex": {
    areaId: "forgotten-cathedral",
    id: "cathedral-narthex",
    label: "Forgotten Cathedral — Narthex",
    regionId: "elarion",
    sceneMap: CATHEDRAL_NARTHEX_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "elarion-gate", targetRoom: "elarion-gate-main" },
      { direction: "right", spawn: spawn(2, 6), targetArea: "forgotten-cathedral", targetRoom: "cathedral-choir" },
    ],
  },
  "cathedral-choir": {
    areaId: "forgotten-cathedral",
    id: "cathedral-choir",
    label: "Forgotten Cathedral — Choir",
    regionId: "elarion",
    sceneMap: CATHEDRAL_CHOIR_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "forgotten-cathedral", targetRoom: "cathedral-narthex" },
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "lucent-sanctum",
        targetRoom: "lucent-antechamber",
        when: (state) => Boolean(state.flags.cathedralComplete),
      },
    ],
  },
  "lucent-antechamber": {
    areaId: "lucent-sanctum",
    id: "lucent-antechamber",
    label: "Lucent Depths — Antechamber",
    regionId: "elarion",
    sceneMap: LUCENT_ANTECHAMBER_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "forgotten-cathedral", targetRoom: "cathedral-choir" },
      {
        direction: "right",
        spawn: spawn(2, 6),
        targetArea: "lucent-sanctum",
        targetRoom: "lucent-throne",
        when: (state) => Boolean(state.flags.lucentCourtDefeated),
      },
    ],
  },
  "lucent-throne": {
    areaId: "lucent-sanctum",
    id: "lucent-throne",
    label: "Lucent Depths — Throne",
    regionId: "elarion",
    sceneMap: LUCENT_THRONE_MAP,
    transitions: [
      { direction: "left", spawn: spawn(17, 6), targetArea: "lucent-sanctum", targetRoom: "lucent-antechamber" },
    ],
  },
};

export const AREAS: Record<string, AreaDefinition> = {
  briarfold: { defaultRoom: "briarfold-main", id: "briarfold", label: "Briarfold", regionId: "briarfold-valley", rooms: ["briarfold-main"] },
  "fold-of-the-lost": { defaultRoom: "fold-entrance", id: "fold-of-the-lost", label: "Fold of the Lost", regionId: "briarfold-valley", rooms: ["fold-entrance", "fold-inner", "fold-heart"] },
  "old-pasture": { defaultRoom: "old-pasture-main", id: "old-pasture", label: "Old Pasture", regionId: "briarfold-valley", rooms: ["old-pasture-main"] },
  "lantern-ruins": { defaultRoom: "lantern-antechamber", id: "lantern-ruins", label: "Lantern Ruins", regionId: "briarfold-valley", rooms: ["lantern-antechamber", "lantern-beacon-hall", "lantern-sanctum-gate"] },
  sanctum: { defaultRoom: "sanctum-witness-hall", id: "sanctum", label: "Sanctum", regionId: "briarfold-valley", rooms: ["sanctum-witness-hall", "sanctum-threshold"] },
  "ashford-crossing": { defaultRoom: "ashford-main", id: "ashford-crossing", label: "Ashford Crossing", regionId: "ashen-moor", rooms: ["ashford-main"] },
  "ember-fen": { defaultRoom: "ember-cistern-entry", id: "ember-fen", label: "Ember Fen", regionId: "ashen-moor", rooms: ["ember-cistern-entry", "ember-cistern-channels", "ember-cistern-heart"] },
  "ashen-spire": { defaultRoom: "ashen-spire-entry", id: "ashen-spire", label: "Ashen Spire", regionId: "ashen-moor", rooms: ["ashen-spire-entry", "ashen-spire-ascent", "ashen-spire-apex"] },
  "kingsroad-pass": { defaultRoom: "kingsroad-main", id: "kingsroad-pass", label: "High Kingsroad", regionId: "high-kingsroad", rooms: ["kingsroad-main", "undercroft-entry", "undercroft-seal"] },
  "monastic-ruins": { defaultRoom: "monastic-cloister", id: "monastic-ruins", label: "Monastic Ruins", regionId: "high-kingsroad", rooms: ["monastic-cloister", "monastic-nave", "monastic-choir"] },
  "elarion-gate": { defaultRoom: "elarion-gate-main", id: "elarion-gate", label: "Elarion Gate", regionId: "elarion", rooms: ["elarion-gate-main"] },
  "forgotten-cathedral": { defaultRoom: "cathedral-narthex", id: "forgotten-cathedral", label: "Forgotten Cathedral", regionId: "elarion", rooms: ["cathedral-narthex", "cathedral-choir"] },
  "lucent-sanctum": { defaultRoom: "lucent-antechamber", id: "lucent-sanctum", label: "Lucent Sanctum", regionId: "elarion", rooms: ["lucent-antechamber", "lucent-throne"] },
};

export const REGIONS: Record<string, RegionDefinition> = {
  "briarfold-valley": {
    areas: ["briarfold", "fold-of-the-lost", "old-pasture", "lantern-ruins", "sanctum"],
    id: "briarfold-valley",
    label: "Briarfold Valley",
  },
  "ashen-moor": {
    areas: ["ashford-crossing", "ember-fen", "ashen-spire"],
    id: "ashen-moor",
    label: "Ashen Moor",
  },
  "high-kingsroad": {
    areas: ["kingsroad-pass", "monastic-ruins"],
    id: "high-kingsroad",
    label: "High Kingsroad",
  },
  elarion: {
    areas: ["elarion-gate", "forgotten-cathedral", "lucent-sanctum"],
    id: "elarion",
    label: "Elarion",
  },
};

export function getRoom(roomId: string): RoomDefinition {
  const room = ROOMS[roomId];
  if (!room) throw new Error(`Unknown room: ${roomId}`);
  return room;
}

export function getDefaultRoomForArea(areaId: string): RoomDefinition {
  const area = AREAS[areaId];
  if (!area) throw new Error(`Unknown area: ${areaId}`);
  return getRoom(area.defaultRoom);
}
