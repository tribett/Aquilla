import type { AreaId, Direction, GameState, RegionId, RoomId } from "../game/types";

export interface RoomTransition {
  direction: Direction;
  spawn: { player: { x: number; y: number }; dog: { x: number; y: number } };
  targetArea: AreaId;
  targetRoom: RoomId;
  when?: (state: GameState) => boolean;
}

export interface RoomDefinition {
  id: RoomId;
  areaId: AreaId;
  regionId: RegionId;
  sceneMap: readonly string[];
  label: string;
  transitions: readonly RoomTransition[];
}

export interface AreaDefinition {
  id: AreaId;
  regionId: RegionId;
  label: string;
  defaultRoom: RoomId;
  rooms: readonly RoomId[];
}

export interface RegionDefinition {
  id: RegionId;
  label: string;
  areas: readonly AreaId[];
}
