export type AreaId = "briarfold" | "old-pasture" | "fold-of-the-lost";

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
}

export interface Sheepdog extends Actor {
  style: "border-collie";
  command: DogCommand;
}

export interface Sheep extends Actor {
  gathered: boolean;
}

export interface Objectives {
  gatheredSheep: number;
  requiredSheep: number;
  waterRestored: boolean;
  guardianCalmed: boolean;
  foldRestored: boolean;
}

export interface GameState {
  region: "briarfold-valley";
  currentArea: AreaId;
  player: Player;
  dog: Sheepdog;
  sheep: Sheep[];
  inventory: InventoryItem[];
  objectives: Objectives;
}

export interface WorldMap {
  width: number;
  height: number;
  blockedTiles: Vector2[];
}
