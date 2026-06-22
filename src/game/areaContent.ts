import type { Creature, GameState, Hazard } from "./types";

const KINGSROAD_SNARES: Hazard[] = [
  {
    active: true,
    id: "kingsroad-snare-east",
    kind: "thorn-snare",
    name: "East Kingsroad Snare",
    position: { x: 4, y: 2 },
  },
  {
    active: true,
    id: "kingsroad-snare-center",
    kind: "thorn-snare",
    name: "Center Kingsroad Snare",
    position: { x: 10, y: 4 },
  },
  {
    active: true,
    id: "kingsroad-snare-west",
    kind: "thorn-snare",
    name: "West Kingsroad Snare",
    position: { x: 15, y: 8 },
  },
];

const EMBER_SENTINEL: Creature = {
  id: "ember-fen-sentinel",
  kind: "false-light-sentinel",
  name: "Ember Fen Sentinel",
  patrol: [
    { x: 8, y: 9 },
    { x: 10, y: 9 },
  ],
  patrolIndex: 0,
  position: { x: 8, y: 9 },
  state: "hostile",
};

const ASHEN_ARCHON: Creature = {
  id: "ashen-spire-archon",
  kind: "false-light-sentinel",
  name: "False-Light Archon",
  patrol: [
    { x: 8, y: 9 },
    { x: 10, y: 9 },
  ],
  patrolIndex: 0,
  position: { x: 8, y: 9 },
  state: "hostile",
};

const MEMORY_THIEF: Creature = {
  id: "memory-thief",
  kind: "false-light-sentinel",
  name: "Memory Thief",
  patrol: [
    { x: 8, y: 9 },
    { x: 11, y: 9 },
  ],
  patrolIndex: 0,
  position: { x: 9, y: 9 },
  state: "hostile",
};

const LUCENT_SENTINEL: Creature = {
  id: "lucent-court-sentinel",
  kind: "false-light-sentinel",
  name: "Lucent Court Sentinel",
  patrol: [
    { x: 8, y: 9 },
    { x: 10, y: 9 },
  ],
  patrolIndex: 0,
  position: { x: 9, y: 9 },
  state: "hostile",
};

const FOLD_SHADOW_WOLF: Creature = {
  id: "fold-shadow-wolf",
  kind: "shadow-wolf",
  name: "Shadowed Wolf",
  patrol: [
    { x: 8, y: 8 },
    { x: 12, y: 8 },
    { x: 10, y: 10 },
  ],
  patrolIndex: 0,
  position: { x: 8, y: 8 },
  state: "hostile",
};

function mergeHazards(state: GameState, hazards: Hazard[]): GameState {
  const existing = new Set(state.hazards.map((hazard) => hazard.id));
  const additions = hazards.filter((hazard) => !existing.has(hazard.id));

  if (additions.length === 0) return state;

  return {
    ...state,
    hazards: [...state.hazards, ...additions],
  };
}

function mergeCreature(state: GameState, creature: Creature, defeatedFlag: string): GameState {
  if (state.flags[defeatedFlag]) return state;
  if (state.creatures.some((entry) => entry.id === creature.id)) return state;

  return {
    ...state,
    creatures: [...state.creatures, creature],
  };
}

export function ensureEpicAreaContent(state: GameState): GameState {
  let next = state;

  if (next.currentArea === "kingsroad-pass" && next.flags.kingsroadUnlocked) {
    next = mergeHazards(next, KINGSROAD_SNARES);
  }

  if (next.currentRoom === "ember-cistern-channels" && !next.flags.emberSentinelCalmed) {
    next = mergeCreature(next, EMBER_SENTINEL, "emberSentinelCalmed");
  }

  if (next.currentRoom === "ashen-spire-ascent" && !next.flags.ashenSpireDefeated) {
    next = mergeCreature(next, ASHEN_ARCHON, "ashenSpireDefeated");
  }

  if (next.currentRoom === "monastic-nave" && !next.flags.memoryThiefDefeated) {
    next = mergeCreature(next, MEMORY_THIEF, "memoryThiefDefeated");
  }

  if (next.currentRoom === "lucent-antechamber" && !next.flags.lucentCourtDefeated) {
    next = mergeCreature(next, LUCENT_SENTINEL, "lucentCourtDefeated");
  }

  if (next.currentArea === "fold-of-the-lost" && next.currentRoom === "fold-inner") {
    next = mergeCreature(next, FOLD_SHADOW_WOLF, "foldShadowWolfRestored");
  }

  return next;
}

export function getActiveEpicCreatures(state: GameState): Creature[] {
  return state.creatures.filter((creature) => {
    if (creature.kind === "thorn-prowler") {
      return state.currentArea === "briarfold";
    }

    if (creature.kind === "shadow-wolf") {
      return state.currentArea === "fold-of-the-lost" && state.currentRoom === "fold-inner";
    }

    if (creature.kind !== "false-light-sentinel") return true;

    if (state.currentRoom === "ember-cistern-channels") return creature.id === "ember-fen-sentinel";
    if (state.currentRoom === "ashen-spire-ascent") return creature.id === "ashen-spire-archon";
    if (state.currentRoom === "monastic-nave") return creature.id === "memory-thief";
    if (state.currentRoom === "lucent-antechamber") return creature.id === "lucent-court-sentinel";

    return false;
  });
}

export function getActiveEpicHazards(state: GameState): Hazard[] {
  if (state.currentArea !== "kingsroad-pass") {
    return state.hazards.filter((hazard) => !hazard.id.startsWith("kingsroad-snare"));
  }

  return state.hazards;
}

export const KINGSROAD_SNARE_COUNT = KINGSROAD_SNARES.length;
