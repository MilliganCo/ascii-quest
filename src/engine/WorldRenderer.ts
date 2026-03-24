import { Container } from 'pixi.js';
import { getChunk, getChunkCoords, getEnemiesInView } from '../game/ChunkManager';
import { createTileSprite, createEntitySprite } from './TileRenderer';
import { PLAYER_CHAR, PLAYER_COLOR } from '../game/entities/Player';
import { getEnemyColor } from '../game/entities/Enemy';
import type { Enemy } from '../game/entities/Enemy';
import type { TileType, Vec2 } from '../types';
import { getTileDimensions, worldToScreen } from './isometry';
import { CHUNK_SIZE } from '../procedural/ChunkGenerator';

export function createWorldContainer(): Container {
  return new Container();
}

export function updateWorldView(
  worldContainer: Container,
  cameraWorldX: number,
  cameraWorldY: number,
  viewWidth: number,
  viewHeight: number,
  playerPosition?: Vec2
): void {
  worldContainer.removeChildren();
  const cameraScreen = worldToScreen({ x: cameraWorldX, y: cameraWorldY });
  worldContainer.position.set(
    viewWidth / 2 - cameraScreen.x,
    viewHeight / 2 - cameraScreen.y
  );
  const { width: tw, height: th } = getTileDimensions();
  const tilesWide = Math.ceil(viewWidth / tw) + 4;
  const tilesTall = Math.ceil(viewHeight / th) + 4;
  const startX = Math.floor(cameraWorldX - tilesWide / 2);
  const startY = Math.floor(cameraWorldY - tilesTall / 2);

  for (let oy = 0; oy < tilesTall; oy++) {
    for (let ox = 0; ox < tilesWide; ox++) {
      const wx = startX + ox;
      const wy = startY + oy;
      const { cx, cy } = getChunkCoords(wx, wy);
      const chunk = getChunk(cx, cy);
      const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const tile = (chunk.tiles[ly]?.[lx] ?? 'grass') as TileType;
      const sprite = createTileSprite(tile, { x: wx, y: wy });
      worldContainer.addChild(sprite);
    }
  }

  const cxMin = Math.floor(startX / CHUNK_SIZE);
  const cxMax = Math.floor((startX + tilesWide) / CHUNK_SIZE);
  const cyMin = Math.floor(startY / CHUNK_SIZE);
  const cyMax = Math.floor((startY + tilesTall) / CHUNK_SIZE);
  const enemies = getEnemiesInView(cxMin, cxMax, cyMin, cyMax);
  const aliveEnemies = enemies.filter((e) => e.hp > 0);

  type EntityItem = { pos: Vec2; char: string; color: string };
  const entities: EntityItem[] = aliveEnemies.map((e: Enemy) => ({
    pos: e.position,
    char: e.char,
    color: getEnemyColor(e.dangerLevel),
  }));
  if (playerPosition !== undefined) {
    entities.push({ pos: playerPosition, char: PLAYER_CHAR, color: PLAYER_COLOR });
  }
  entities.sort((a, b) => a.pos.y - b.pos.y);

  for (const e of entities) {
    const sprite = createEntitySprite(e.char, e.color, e.pos);
    worldContainer.addChild(sprite);
  }
}
