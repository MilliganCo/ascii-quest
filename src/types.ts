import type { Enemy } from './game/entities/Enemy';

export type TileType = 'grass' | 'stone' | 'water' | 'tree';

export interface Vec2 {
  x: number;
  y: number;
}

export interface ChunkData {
  tiles: TileType[][];
  chunkX: number;
  chunkY: number;
  enemies?: Enemy[];
}
