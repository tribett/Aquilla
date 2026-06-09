import { describe, expect, it } from "vitest";
import {
  AQUILLA_SAVE_KEY,
  clearGameSave,
  loadGameSave,
  saveGame,
  type GameSaveSnapshot,
} from "../../src/game/save";
import { createInitialState } from "../../src/game/createInitialState";

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

describe("game save persistence", () => {
  it("round-trips restored progress and encounter states", () => {
    const storage = new MemoryStorage();
    const initialState = createInitialState();
    const snapshot: GameSaveSnapshot = {
      fearEcho: { id: "old-pasture-fear-echo", kind: "fear-echo", state: "restored" },
      guardian: { id: "fold-guardian", kind: "corrupted-guardian", state: "restored" },
      questMessage: "The fear echo releases its borrowed voice and becomes still.",
      state: {
        ...initialState,
        currentArea: "old-pasture",
        objectives: {
          ...initialState.objectives,
          fearEchoCalmed: true,
          foldRestored: true,
          gatheredSheep: 3,
          guardianCalmed: true,
          waterRestored: true,
        },
        player: {
          ...initialState.player,
          position: { x: 6, y: 6 },
        },
      },
      version: 4,
      waterChannel: { id: "dry-channel", kind: "water-channel", active: true },
    };

    saveGame(storage, snapshot);

    expect(loadGameSave(storage)).toEqual(snapshot);
  });

  it("ignores malformed save data and can clear the save slot", () => {
    const storage = new MemoryStorage();
    storage.setItem(AQUILLA_SAVE_KEY, "{bad-json");

    expect(loadGameSave(storage)).toBeUndefined();

    saveGame(storage, {
      fearEcho: { id: "old-pasture-fear-echo", kind: "fear-echo", state: "hostile" },
      guardian: { id: "fold-guardian", kind: "corrupted-guardian", state: "hostile" },
      questMessage: "Seek the scattered sheep, restore the spring, and make the Fold ready.",
      state: createInitialState(),
      version: 4,
      waterChannel: { id: "dry-channel", kind: "water-channel", active: false },
    });
    clearGameSave(storage);

    expect(storage.getItem(AQUILLA_SAVE_KEY)).toBeNull();
  });
});
