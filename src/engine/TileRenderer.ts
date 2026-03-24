import { Sprite } from 'pixi.js';
import { worldToScreen, getTileDimensions } from './isometry';
import { getCharTexture } from './AsciiTexture';
import type { Vec2, TileType } from '../types';

const TILE_CHARS: Record<TileType, string> = {
  grass: '.',
  stone: '#',
  water: '~',
  tree: 'T',
};

const TILE_COLORS: Record<TileType, string> = {
  grass: '#6b7b5c',
  stone: '#7a7a7a',
  water: '#5a6b7a',
  tree: '#4a5a4a',
};

/**
 * Creates a sprite for a tile at the given world position.
 */
export function createTileSprite(tileType: TileType, worldPos: Vec2): Sprite {
  const char = TILE_CHARS[tileType];
  const color = TILE_COLORS[tileType];
  const texture = getCharTexture(char, color);

  const sprite = new Sprite({ texture });
  sprite.anchor.set(0.5, 1);

  const screen = worldToScreen(worldPos);
  sprite.position.set(screen.x, screen.y);

  const { width, height } = getTileDimensions();
  sprite.width = width;
  sprite.height = height;

  return sprite;
}

/**
 * Creates a sprite for an entity (arbitrary char/color) at the given world position.
 */
export function createEntitySprite(char: string, color: string, worldPos: Vec2): Sprite {
  const texture = getCharTexture(char, color);

  const sprite = new Sprite({ texture });
  sprite.anchor.set(0.5, 1);

  const screen = worldToScreen(worldPos);
  sprite.position.set(screen.x, screen.y);

  const { width, height } = getTileDimensions();
  sprite.width = width;
  sprite.height = height;

  return sprite;
}
