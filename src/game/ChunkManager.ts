import type { ChunkData } from '../types';
import type { Enemy } from './entities/Enemy';
import { CHUNK_SIZE, generateChunk } from '../procedural/ChunkGenerator';

const chunkCache = new Map<string, ChunkData>();

function chunkKey(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

export function getChunk(cx: number, cy: number): ChunkData {
  const key = chunkKey(cx, cy);
  if (!chunkCache.has(key)) {
    chunkCache.set(key, generateChunk(cx, cy));
  }
  return chunkCache.get(key)!;
}

export function getChunkCoords(worldX: number, worldY: number): { cx: number; cy: number } {
  return {
    cx: Math.floor(worldX / CHUNK_SIZE),
    cy: Math.floor(worldY / CHUNK_SIZE),
  };
}

/** Returns enemies from all chunks in the given chunk range. */
export function getEnemiesInView(
  cxMin: number,
  cxMax: number,
  cyMin: number,
  cyMax: number
): Enemy[] {
  const enemies: Enemy[] = [];
  for (let cy = cyMin; cy <= cyMax; cy++) {
    for (let cx = cxMin; cx <= cxMax; cx++) {
      const chunk = getChunk(cx, cy);
      if (chunk.enemies) {
        enemies.push(...chunk.enemies);
      }
    }
  }
  return enemies;
}
