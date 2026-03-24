import type { GameState } from './GameState';
import { getChunk, getChunkCoords } from './ChunkManager';
import { CHUNK_SIZE } from '../procedural/ChunkGenerator';
import type { TileType, Vec2 } from '../types';

const ARRIVAL_THRESHOLD = 0.5;

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

function normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return v;
  return { x: v.x / len, y: v.y / len };
}

function distance(a: Vec2, b: Vec2): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

export function updateMovement(state: GameState, dt: number): void {
  let direction: Vec2 | null = null;

  if (state.moveTarget !== null) {
    const dist = distance(state.playerPosition, state.moveTarget);
    if (dist < ARRIVAL_THRESHOLD) {
      state.moveTarget = null;
      state.isMoving = false;
      return;
    }
    direction = normalize({
      x: state.moveTarget.x - state.playerPosition.x,
      y: state.moveTarget.y - state.playerPosition.y,
    });
  } else if (state.moveDirection !== null) {
    direction = state.moveDirection;
  }

  if (direction === null) {
    state.isMoving = false;
    return;
  }

  const newX =
    state.playerPosition.x + direction.x * state.moveSpeed * dt;
  const newY =
    state.playerPosition.y + direction.y * state.moveSpeed * dt;

  const tile = getTileAtWorldPosition(newX, newY);
  if (isBlockingTile(tile)) {
    state.isMoving = false;
    if (state.moveTarget !== null) {
      state.moveTarget = null;
    }
    return;
  }

  state.playerPosition = { x: newX, y: newY };
  state.isMoving = true;
}
