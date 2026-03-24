import type { Vec2 } from '../types';

const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;

/**
 * Converts world/grid coordinates to screen (pixel) coordinates.
 */
export function worldToScreen(world: Vec2): Vec2 {
  return {
    x: (world.x - world.y) * (TILE_WIDTH / 2),
    y: (world.x + world.y) * (TILE_HEIGHT / 2),
  };
}

/**
 * Converts screen (pixel) coordinates to world/grid coordinates.
 */
export function screenToWorld(screen: Vec2): Vec2 {
  const x =
    (screen.x / (TILE_WIDTH / 2) + screen.y / (TILE_HEIGHT / 2)) / 2;
  const y =
    (screen.y / (TILE_HEIGHT / 2) - screen.x / (TILE_WIDTH / 2)) / 2;
  return {
    x: Math.floor(x),
    y: Math.floor(y),
  };
}

/**
 * Returns the tile dimensions used for isometric projection.
 */
export function getTileDimensions(): { width: number; height: number } {
  return { width: TILE_WIDTH, height: TILE_HEIGHT };
}
