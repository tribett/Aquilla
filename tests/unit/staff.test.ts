import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { useStaffOnObject } from "../../src/game/staff";
import type { Interactable } from "../../src/game/types";

describe("useStaffOnObject", () => {
  it("rings an old fold bell", () => {
    const bell: Interactable = { id: "fold-bell", kind: "bell", active: false };

    const result = useStaffOnObject(createInitialState(), bell);

    expect(result.object.active).toBe(true);
    expect(result.state.objectives.foldBellRung).toBe(true);
    expect(result.message).toBe("The fold-bell rings clear across the pasture.");
  });

  it("restores water when Aquilla redirects the dry channel", () => {
    const channel: Interactable = { id: "dry-channel", kind: "water-channel", active: false };

    const result = useStaffOnObject(createInitialState(), channel);

    expect(result.state.objectives.waterRestored).toBe(true);
    expect(result.object.active).toBe(true);
  });
});
