export type RegionId = "ashen-moor" | "briarfold-valley" | "elarion" | "high-kingsroad";

export type AreaId =
  | "ashen-spire"
  | "ashford-crossing"
  | "briarfold"
  | "elarion-gate"
  | "ember-fen"
  | "fold-of-the-lost"
  | "forgotten-cathedral"
  | "kingsroad-pass"
  | "lantern-ruins"
  | "lucent-sanctum"
  | "monastic-ruins"
  | "old-pasture"
  | "sanctum";

export type RoomId = string;

export type Direction = "up" | "down" | "left" | "right";

export type InventoryItem =
  | "grove-lantern"
  | "harp-of-remembrance"
  | "lantern-of-witness"
  | "shepherd-staff";

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

export type CreatureKind = "false-light-sentinel" | "shadow-wolf" | "thorn-prowler";

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
  foldBellRung: boolean;
  foldRestored: boolean;
  gameComplete: boolean;
  gatheredSheep: number;
  guardianCalmed: boolean;
  hiddenGroveFound: boolean;
  hiddenGroveLanternClaimed: boolean;
  introSeen: boolean;
  lanternRuinsRestored: boolean;
  requiredCreedBeacons: number;
  requiredSanctumWitnessSteps: number;
  requiredSheep: number;
  returnedHome: boolean;
  sanctumWitnessSteps: number;
  requiredThornSnares: number;
  requiredThornProwlers: number;
  storyComplete: boolean;
  thornSnaresCleared: number;
  thornProwlersRestored: number;
  waterRestored: boolean;
}

export interface GameState {
  chapter: number;
  currentArea: AreaId;
  currentRoom: RoomId;
  creatures: Creature[];
  dog: Sheepdog;
  flags: Record<string, boolean>;
  hazards: Hazard[];
  inventory: InventoryItem[];
  objectives: Objectives;
  playtimeMinutes: number;
  player: Player;
  region: RegionId;
  sheep: Sheep[];
}

export interface WorldMap {
  width: number;
  height: number;
  blockedTiles: Vector2[];
}

export type InteractableKind = "bell" | "stone" | "shepherd-gate" | "water-channel";

export interface Interactable {
  active: boolean;
  id: string;
  kind: InteractableKind;
}

export type EncounterKind =
  | "corrupted-guardian"
  | "false-light-archon"
  | "false-light-sentinel"
  | "fear-echo"
  | "thorn-beast";

export type EncounterState = "hostile" | "restored" | "stunned";

export type EncounterAction = "staff-calm" | "staff-stun";

export interface Encounter {
  id: string;
  kind: EncounterKind;
  state: EncounterState;
}
