export type AreaId =
  | "briarfold"
  | "old-pasture"
  | "lantern-ruins"
  | "sanctum"
  | "fold-of-the-lost";

export type Direction = "up" | "down" | "left" | "right";

export type InventoryItem = "shepherd-staff";

export type DogCommand = "follow" | "stay" | "fetch" | "herd" | "distract";

export interface Vector2 {
  x: number;
  y: number;
}

export interface Actor {
  id: string;
  name: string;
  position: Vector2;
}

export interface Player extends Actor {
  role: "shepherd-boy";
  facing: Direction;
  health: number;
  maxHealth: number;
}

export interface Sheepdog extends Actor {
  style: "border-collie";
  command: DogCommand;
}

export interface Sheep extends Actor {
  gathered: boolean;
}

export interface Hazard extends Actor {
  active: boolean;
  kind: "thorn-snare";
}

export type CreatureKind = "thorn-prowler";

export type CreatureState = "hostile" | "distracted" | "restored";

export interface Creature extends Actor {
  kind: CreatureKind;
  patrol: Vector2[];
  patrolIndex: number;
  state: CreatureState;
}

export interface Objectives {
  creedBeaconsLit: number;
  fearEchoCalmed: boolean;
  foldRestored: boolean;
  gameComplete: boolean;
  gatheredSheep: number;
  guardianCalmed: boolean;
  hiddenGroveFound: boolean;
  lanternRuinsRestored: boolean;
  requiredCreedBeacons: number;
  requiredSanctumWitnessSteps: number;
  requiredSheep: number;
  sanctumWitnessSteps: number;
  requiredThornSnares: number;
  requiredThornProwlers: number;
  thornSnaresCleared: number;
  thornProwlersRestored: number;
  waterRestored: boolean;
}

export interface GameState {
  region: "briarfold-valley";
  currentArea: AreaId;
  player: Player;
  creatures: Creature[];
  dog: Sheepdog;
  hazards: Hazard[];
  sheep: Sheep[];
  inventory: InventoryItem[];
  objectives: Objectives;
}

export interface WorldMap {
  width: number;
  height: number;
  blockedTiles: Vector2[];
}

export type InteractableKind = "bell" | "water-channel" | "shepherd-gate" | "stone";

export interface Interactable {
  id: string;
  kind: InteractableKind;
  active: boolean;
}

export type EncounterKind = "thorn-beast" | "corrupted-guardian" | "fear-echo";

export type EncounterState = "hostile" | "stunned" | "restored";

export type EncounterAction = "staff-stun" | "staff-calm";

export interface Encounter {
  id: string;
  kind: EncounterKind;
  state: EncounterState;
}
