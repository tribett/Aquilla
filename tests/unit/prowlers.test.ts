import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import {
  advanceProwlers,
  distractOrRestoreProwler,
  resolveProwlerStep,
} from "../../src/game/prowlers";

describe("thorn prowlers", () => {
  it("patrols active prowlers along their path", () => {
    const initialState = createInitialState();
    const firstProwler = initialState.creatures[0];

    const advanced = advanceProwlers(initialState);

    expect(advanced.creatures[0]).toEqual({
      ...firstProwler,
      patrolIndex: 1,
      position: firstProwler.patrol[1],
    });

    const restored = {
      ...advanced,
      creatures: advanced.creatures.map((creature) => ({
        ...creature,
        state: "restored" as const,
      })),
    };

    expect(advanceProwlers(restored).creatures[0]).toEqual(restored.creatures[0]);
  });

  it("costs resolve and pushes Aquilla back when he runs into a hostile prowler", () => {
    const initialState = createInitialState();
    const prowler = initialState.creatures[0];
    const previousPosition = { x: prowler.position.x, y: prowler.position.y + 1 };
    const state = {
      ...initialState,
      player: {
        ...initialState.player,
        position: prowler.position,
      },
    };

    const result = resolveProwlerStep(state, previousPosition);

    expect(result.state.player.health).toBe(2);
    expect(result.state.player.position).toEqual(previousPosition);
    expect(result.message).toContain("prowler");
  });

  it("uses the sheepdog to distract a prowler before restoring it", () => {
    const initialState = createInitialState();
    const prowler = initialState.creatures[0];

    const distracted = distractOrRestoreProwler(initialState, prowler.id);

    expect(distracted.state.dog.command).toBe("distract");
    expect(distracted.state.creatures[0].state).toBe("distracted");
    expect(distracted.state.objectives.thornProwlersRestored).toBe(0);
    expect(distracted.message).toContain("draws the prowler");

    const restored = distractOrRestoreProwler(distracted.state, prowler.id);

    expect(restored.state.creatures[0].state).toBe("restored");
    expect(restored.state.objectives.thornProwlersRestored).toBe(1);
    expect(restored.message).toContain("restored");
  });
});
