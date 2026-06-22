import type { AreaId, GameState } from "../../game/types";
import { hasFlag } from "../../game/flags";

export type DungeonId =
  | "fold-of-the-lost"
  | "lantern-ruins"
  | "sanctum-witness"
  | "ember-fen-cistern"
  | "ashen-spire"
  | "monastic-vault"
  | "kingsroad-undercroft"
  | "lucent-depths";

export interface DungeonDefinition {
  id: DungeonId;
  label: string;
  subtitle: string;
  chapter: number;
  areaIds: readonly AreaId[];
  roomIds: readonly string[];
  bossLabel: string;
  rewardLabel: string;
  isComplete: (state: GameState) => boolean;
}

export const DUNGEONS: readonly DungeonDefinition[] = [
  {
    areaIds: ["fold-of-the-lost"],
    bossLabel: "Corrupted Guardian",
    chapter: 1,
    id: "fold-of-the-lost",
    isComplete: (s) => Boolean(s.objectives.foldRestored && s.flags.foldDungeonComplete),
    label: "The Fold of the Lost",
    rewardLabel: "Refuge restored",
    roomIds: ["fold-entrance", "fold-inner", "fold-heart"],
    subtitle: "Gather the lost; calm the guardian; restore the fold.",
  },
  {
    areaIds: ["lantern-ruins"],
    bossLabel: "False Light Warden",
    chapter: 1,
    id: "lantern-ruins",
    isComplete: (s) => s.objectives.lanternRuinsRestored,
    label: "Lantern Ruins",
    rewardLabel: "Creed beacons lit",
    roomIds: ["lantern-antechamber", "lantern-beacon-hall", "lantern-sanctum-gate"],
    subtitle: "Light Maker, Redeemer, and Giver in order.",
  },
  {
    areaIds: ["sanctum"],
    bossLabel: "Fear of Unworthiness",
    chapter: 1,
    id: "sanctum-witness",
    isComplete: (s) => s.objectives.gameComplete,
    label: "Sanctum of Witness",
    rewardLabel: "Remember · Receive · Return",
    roomIds: ["sanctum-witness-hall", "sanctum-threshold"],
    subtitle: "Complete the witness path without pride.",
  },
  {
    areaIds: ["ember-fen"],
    bossLabel: "Ember Fen Sentinel",
    chapter: 2,
    id: "ember-fen-cistern",
    isComplete: (s) => hasFlag(s, "emberFenComplete"),
    label: "Ember Fen Cistern",
    rewardLabel: "Channels cleansed",
    roomIds: ["ember-cistern-entry", "ember-cistern-channels", "ember-cistern-heart"],
    subtitle: "Turn the fen channels back toward mercy.",
  },
  {
    areaIds: ["ashen-spire"],
    bossLabel: "False-Light Archon",
    chapter: 2,
    id: "ashen-spire",
    isComplete: (s) => hasFlag(s, "lanternOfWitnessClaimed"),
    label: "Ashen Spire",
    rewardLabel: "Lantern of Witness",
    roomIds: ["ashen-spire-entry", "ashen-spire-ascent", "ashen-spire-apex"],
    subtitle: "Break false light; receive received light.",
  },
  {
    areaIds: ["monastic-ruins"],
    bossLabel: "Memory Thief",
    chapter: 3,
    id: "monastic-vault",
    isComplete: (s) => hasFlag(s, "harpOfRemembranceClaimed"),
    label: "Monastic Vault",
    rewardLabel: "Harp of Remembrance",
    roomIds: ["monastic-cloister", "monastic-nave", "monastic-choir"],
    subtitle: "Sing faith, hope, and love; play the harp melody.",
  },
  {
    areaIds: ["kingsroad-pass"],
    bossLabel: "Thorn Binder",
    chapter: 3,
    id: "kingsroad-undercroft",
    isComplete: (s) => hasFlag(s, "undercroftSealOpened"),
    label: "Kingsroad Undercroft",
    rewardLabel: "Kingsroad seal broken",
    roomIds: ["kingsroad-main", "undercroft-entry", "undercroft-seal"],
    subtitle: "Clear the snares; open the undercroft seal.",
  },
  {
    areaIds: ["forgotten-cathedral", "lucent-sanctum"],
    bossLabel: "Lucent Court Sentinel",
    chapter: 4,
    id: "lucent-depths",
    isComplete: (s) => hasFlag(s, "lucentCourtDefeated"),
    label: "Lucent Depths",
    rewardLabel: "False unity shattered",
    roomIds: [
      "cathedral-narthex",
      "cathedral-choir",
      "lucent-antechamber",
      "lucent-throne",
    ],
    subtitle: "Restore worship; break the Lucent Court.",
  },
];

export function getDungeonById(id: DungeonId): DungeonDefinition {
  const dungeon = DUNGEONS.find((entry) => entry.id === id);
  if (!dungeon) throw new Error(`Unknown dungeon: ${id}`);
  return dungeon;
}

export function getDungeonForRoom(roomId: string): DungeonDefinition | undefined {
  return DUNGEONS.find((dungeon) => dungeon.roomIds.includes(roomId));
}

export function getDungeonProgress(state: GameState): {
  cleared: number;
  total: number;
  entries: Array<{ id: DungeonId; label: string; complete: boolean }>;
} {
  const entries = DUNGEONS.map((dungeon) => ({
    complete: dungeon.isComplete(state),
    id: dungeon.id,
    label: dungeon.label,
  }));

  return {
    cleared: entries.filter((entry) => entry.complete).length,
    entries,
    total: DUNGEONS.length,
  };
}

export function getDungeonMapLines(state: GameState): string[] {
  return getDungeonProgress(state).entries.map(
    (entry) => `${entry.complete ? "✓" : "·"} ${entry.label}`,
  );
}
