import type { ChunkData, TileType } from '../types';
import type { Enemy } from '../game/entities/Enemy';
import { getEnemyChar } from '../game/entities/Enemy';
import { noise2D, seededRandom } from './noise';

export const CHUNK_SIZE = 32;
export const WORLD_SEED = 12345;

function pickGrassPositions(chunkX: number, chunkY: number, tiles: TileType[][]): { lx: number; ly: number }[] {
  const candidates: { lx: number; ly: number }[] = [];
  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      if (tiles[ly][lx] === 'grass') {
        candidates.push({ lx, ly });
      }
    }
  }
  const rng = seededRandom(((chunkX * 73856093) ^ (chunkY * 19349663) ^ WORLD_SEED) >>> 0);
  const count = Math.floor(rng() * 3); // 0, 1, or 2
  const result: { lx: number; ly: number }[] = [];
  for (let i = 0; i < count && candidates.length > 0; i++) {
    const idx = Math.floor(rng() * candidates.length);
    result.push(candidates[idx]);
    candidates.splice(idx, 1);
  }
  return result;
}

function createEnemy(id: string, chunkX: number, chunkY: number, lx: number, ly: number, dangerLevel: 1 | 2 | 3): Enemy {
  const baseHp = dangerLevel * 10;
  const baseDamage = dangerLevel * 3;
  return {
    id,
    position: { x: chunkX * 32 + lx, y: chunkY * 32 + ly },
    hp: baseHp,
    maxHp: baseHp,
    damage: baseDamage,
    dangerLevel,
    char: getEnemyChar(dangerLevel),
    lastAttackTime: 0,
  };
}

export function generateChunk(chunkX: number, chunkY: number): ChunkData {
  const tiles: TileType[][] = [];

  for (let dy = 0; dy < CHUNK_SIZE; dy++) {
    const row: TileType[] = [];
    for (let dx = 0; dx < CHUNK_SIZE; dx++) {
      const wx = chunkX * 32 + dx;
      const wy = chunkY * 32 + dy;

      const height = noise2D(wx * 0.05, wy * 0.05, WORLD_SEED);
      const moisture = noise2D(wx * 0.07 + 100, wy * 0.07, WORLD_SEED);

      let tile: TileType;
      if (height < 0.3) {
        tile = 'water';
      } else if (height > 0.7) {
        tile = 'stone';
      } else if (moisture > 0.6) {
        tile = 'tree';
      } else {
        tile = 'grass';
      }
      row.push(tile);
    }
    tiles.push(row);
  }

  const grassSpots = pickGrassPositions(chunkX, chunkY, tiles);
  const rng = seededRandom(((chunkX * 73856093) ^ (chunkY * 19349663) ^ (WORLD_SEED + 1)) >>> 0);
  const enemies: Enemy[] = grassSpots.map(({ lx, ly }, i) => {
    const dangerLevel = (Math.floor(rng() * 3) + 1) as 1 | 2 | 3;
    return createEnemy(`enemy-${chunkX}-${chunkY}-${i}`, chunkX, chunkY, lx, ly, dangerLevel);
  });

  return { tiles, chunkX, chunkY, enemies };
}
