import { describe, expect, it } from "vitest";
import { DUNGEONS, getDungeonMapLines, getDungeonProgress } from "../../src/content/dungeons/registry";
import { createInitialState } from "../../src/game/createInitialState";
import { setFlag } from "../../src/game/flags";
import { loadGameSave, type GameSaveSnapshot } from "../../src/game/save";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("eight dungeon registry", () => {
  it("defines eight dungeons with unique room graphs", () => {
    expect(DUNGEONS).toHaveLength(8);

    const roomIds = DUNGEONS.flatMap((dungeon) => dungeon.roomIds);
    expect(new Set(roomIds).size).toBe(roomIds.length);
  });

  it("tracks dungeon progress in the journal map lines", () => {
    const fresh = getDungeonMapLines(createInitialState());

    expect(fresh).toHaveLength(8);
    expect(fresh.every((line) => line.startsWith("·"))).toBe(true);

    const restoredState = setFlag(
      {
        ...createInitialState(),
        objectives: {
          ...createInitialState().objectives,
          foldRestored: true,
        },
      },
      "foldDungeonComplete",
    );
    const restored = getDungeonMapLines(restoredState);

    expect(restored[0]).toMatch(/^✓/);
    expect(getDungeonProgress(restoredState).cleared).toBeGreaterThanOrEqual(1);
  });
});

describe("legacy room migration", () => {
  it("maps older single-room saves onto the new dungeon rooms", () => {
    const storage = new MemoryStorage();
    const initialState = createInitialState();
    const snapshot: GameSaveSnapshot = {
      fearEcho: { id: "old-pasture-fear-echo", kind: "fear-echo", state: "hostile" },
      guardian: { id: "fold-guardian", kind: "corrupted-guardian", state: "hostile" },
      questMessage: "Test",
      state: {
        ...initialState,
        currentArea: "lantern-ruins",
        currentRoom: "lantern-ruins-main",
      },
      version: 6,
      waterChannel: { id: "dry-channel", kind: "water-channel", active: false },
    };

    storage.setItem("aquilla.save.v6", JSON.stringify(snapshot));

    expect(loadGameSave(storage)?.state.currentRoom).toBe("lantern-antechamber");
  });
});
