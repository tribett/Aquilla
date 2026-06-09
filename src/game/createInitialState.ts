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
      health: 3,
      maxHealth: 3,
    },
    creatures: [
      {
        id: "thorn-prowler-north",
        kind: "thorn-prowler",
        name: "North Thorn Prowler",
        patrol: [
          { x: 6, y: 3 },
          { x: 6, y: 4 },
        ],
        patrolIndex: 0,
        position: { x: 6, y: 3 },
        state: "hostile",
      },
    ],
    dog: {
      id: "sheepdog",
      name: "Sheepdog",
      style: "border-collie",
      position: { x: 4, y: 5 },
      command: "follow",
    },
    hazards: [
      {
        active: true,
        id: "thorn-snare-north",
        kind: "thorn-snare",
        name: "North Thorn Snare",
        position: { x: 5, y: 3 },
      },
      {
        active: true,
        id: "thorn-snare-highroad",
        kind: "thorn-snare",
        name: "Highroad Thorn Snare",
        position: { x: 13, y: 3 },
      },
    ],
    sheep: [
      { id: "sheep-1", name: "Lost Sheep 1", position: { x: 9, y: 4 }, gathered: false },
      { id: "sheep-2", name: "Lost Sheep 2", position: { x: 12, y: 7 }, gathered: false },
      { id: "sheep-3", name: "Lost Sheep 3", position: { x: 9, y: 10 }, gathered: false },
    ],
    inventory: ["shepherd-staff"],
    objectives: {
      creedBeaconsLit: 0,
      fearEchoCalmed: false,
      foldBellRung: false,
      foldRestored: false,
      gameComplete: false,
      gatheredSheep: 0,
      guardianCalmed: false,
      hiddenGroveFound: false,
      hiddenGroveLanternClaimed: false,
      lanternRuinsRestored: false,
      requiredCreedBeacons: 3,
      requiredSanctumWitnessSteps: 3,
      requiredSheep: 3,
      sanctumWitnessSteps: 0,
      requiredThornSnares: 2,
      requiredThornProwlers: 1,
      thornSnaresCleared: 0,
      thornProwlersRestored: 0,
      waterRestored: false,
    },
  };
}
