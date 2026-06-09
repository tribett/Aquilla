import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import {
  commandDog,
  fetchNearestLostSheep,
  herdNearestSheep,
  herdSheepById,
  trailDogAfterPlayerMove,
} from "../../src/game/dog";

describe("dog commands", () => {
  it("sets the sheepdog command", () => {
    const state = createInitialState();

    const next = commandDog(state, "stay");

    expect(next.dog.command).toBe("stay");
  });

  it("moves the sheepdog into Aquilla's previous tile while following", () => {
    const initialState = createInitialState();
    const state = {
      ...initialState,
      player: {
        ...initialState.player,
        position: { x: 6, y: 5 },
      },
    };

    const next = trailDogAfterPlayerMove(state, { x: 5, y: 5 });

    expect(next.dog.position).toEqual({ x: 5, y: 5 });
    expect(next.dog.command).toBe("follow");
  });

  it("keeps the sheepdog in place while staying", () => {
    const initialState = commandDog(createInitialState(), "stay");

    const next = trailDogAfterPlayerMove(initialState, { x: 5, y: 5 });

    expect(next.dog.position).toEqual(initialState.dog.position);
    expect(next.dog.command).toBe("stay");
  });

  it("keeps the sheepdog in place after a blocked move", () => {
    const initialState = createInitialState();

    const next = trailDogAfterPlayerMove(initialState, initialState.player.position);

    expect(next.dog.position).toEqual(initialState.dog.position);
    expect(next.dog.command).toBe("follow");
  });

  it("fetches toward the nearest lost sheep without gathering it", () => {
    const initialState = createInitialState();

    const next = fetchNearestLostSheep(initialState);

    expect(next.dog.command).toBe("fetch");
    expect(next.dog.position).toEqual({ x: 9, y: 5 });
    expect(next.objectives.gatheredSheep).toBe(0);
    expect(next.sheep.find((sheep) => sheep.id === "sheep-1")?.gathered).toBe(false);
  });

  it("gathers the nearest lost sheep when commanded to herd", () => {
    const state = commandDog(createInitialState(), "herd");

    const next = herdNearestSheep(state);

    expect(next.objectives.gatheredSheep).toBe(1);
    expect(next.sheep.filter((sheep) => sheep.gathered)).toHaveLength(1);
  });

  it("gathers the closest ungathered sheep even when it is not first", () => {
    const initialState = createInitialState();
    const state = commandDog(
      {
        ...initialState,
        dog: {
          ...initialState.dog,
          position: { x: 0, y: 0 },
        },
        sheep: [
          { id: "far-sheep", name: "Far Sheep", position: { x: 8, y: 8 }, gathered: false },
          { id: "near-sheep", name: "Near Sheep", position: { x: 1, y: 0 }, gathered: false },
          { id: "gathered-sheep", name: "Gathered Sheep", position: { x: 0, y: 1 }, gathered: true },
        ],
      },
      "herd",
    );

    const next = herdNearestSheep(state);

    expect(next.sheep.find((sheep) => sheep.id === "near-sheep")?.gathered).toBe(true);
    expect(next.sheep.find((sheep) => sheep.id === "far-sheep")?.gathered).toBe(false);
  });

  it("gathers a selected sheep by id for proximity interactions", () => {
    const state = commandDog(createInitialState(), "herd");

    const next = herdSheepById(state, "sheep-2");

    expect(next.objectives.gatheredSheep).toBe(1);
    expect(next.sheep.find((sheep) => sheep.id === "sheep-2")?.gathered).toBe(true);
    expect(next.sheep.find((sheep) => sheep.id === "sheep-1")?.gathered).toBe(false);
  });
});
