import { getChunk, getChunkCoords, getEnemiesInView } from './ChunkManager';
import type { GameState } from './GameState';
import type { TileType } from '../types';
import { CHUNK_SIZE } from '../procedural/ChunkGenerator';

const AGRO_RANGE = 8;
const enemySpeed = 1;
const enemyAttackCooldown = 1000;

function isBlockingTile(tile: TileType): boolean {
  return tile === 'water' || tile === 'stone';
}

function getTileAtWorldPosition(worldX: number, worldY: number): TileType {
  const wx = Math.floor(worldX);
  const wy = Math.floor(worldY);
  const { cx, cy } = getChunkCoords(wx, wy);
  const chunk = getChunk(cx, cy);
  const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  return (chunk.tiles[ly]?.[lx] ?? 'grass') as TileType;
}

export function updateEnemyAI(state: GameState, dt: number): void {
  const px = state.playerPosition.x;
  const py = state.playerPosition.y;
  const { cx, cy } = getChunkCoords(px, py);
  const enemies = getEnemiesInView(cx - 1, cx + 1, cy - 1, cy + 1);
  const now = performance.now();

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;

    const ex = enemy.position.x;
    const ey = enemy.position.y;
    const dx = px - ex;
    const dy = py - ey;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > AGRO_RANGE) continue;

    if (dist <= 1) {
      const lastAttack = enemy.lastAttackTime ?? 0;
      if (now - lastAttack >= enemyAttackCooldown) {
        state.playerHp -= enemy.damage;
        enemy.lastAttackTime = now;
      }
      continue;
    }

    const invDist = 1 / dist;
    const dirX = dx * invDist;
    const dirY = dy * invDist;
    const newX = ex + dirX * enemySpeed * dt;
    const newY = ey + dirY * enemySpeed * dt;

    const tileX = Math.floor(newX);
    const tileY = Math.floor(newY);
    const tile = getTileAtWorldPosition(tileX, tileY);
    if (!isBlockingTile(tile)) {
      enemy.position.x = newX;
      enemy.position.y = newY;
    }
  }
}
