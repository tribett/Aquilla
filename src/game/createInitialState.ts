import type { GameState } from "./types";

export function createInitialState(): GameState {
  return {
    region: "briarfold-valley",
    currentArea: "briarfold",
    player: {
      id: "aquilla",
      name: "Aquilla",
      role: "shepherd-boy",
      position: { x: 5, y: 5 },
      facing: "down",
    },
    dog: {
      id: "sheepdog",
      name: "Sheepdog",
      style: "border-collie",
      position: { x: 4, y: 5 },
      command: "follow",
    },
    sheep: [
      { id: "sheep-1", name: "Lost Sheep 1", position: { x: 9, y: 4 }, gathered: false },
      { id: "sheep-2", name: "Lost Sheep 2", position: { x: 12, y: 7 }, gathered: false },
      { id: "sheep-3", name: "Lost Sheep 3", position: { x: 9, y: 10 }, gathered: false },
    ],
    inventory: ["shepherd-staff"],
    objectives: {
      creedBeaconsLit: 0,
      fearEchoCalmed: false,
      foldRestored: false,
      gatheredSheep: 0,
      guardianCalmed: false,
      lanternRuinsRestored: false,
      requiredCreedBeacons: 3,
      requiredSheep: 3,
      waterRestored: false,
    },
  };
}
