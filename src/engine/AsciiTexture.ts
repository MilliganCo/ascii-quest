import { Texture } from 'pixi.js';

export const CHAR_SIZE = 16;
export const FONT = '14px monospace';

const textureCache = new Map<string, Texture>();

/**
 * Draws a character on the given canvas and returns a PixiJS texture from it.
 * @param char - The ASCII character to draw
 * @param color - Hex color string for the character (e.g. '#6b7b5c')
 * @param canvas - Canvas element to draw on (will be modified)
 * @returns Texture created from the canvas
 */
export function createCharTexture(
  char: string,
  color: string,
  canvas: HTMLCanvasElement
): Texture {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  canvas.width = CHAR_SIZE;
  canvas.height = CHAR_SIZE;

  // Fill background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CHAR_SIZE, CHAR_SIZE);

  // Draw character centered
  ctx.fillStyle = color;
  ctx.font = FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, CHAR_SIZE / 2, CHAR_SIZE / 2);

  return Texture.from(canvas, true);
}

/**
 * Returns a cached texture for the given character and color.
 * Creates and caches the texture on first request.
 */
export function getCharTexture(char: string, color: string): Texture {
  const key = `${char}:${color}`;
  let texture = textureCache.get(key);
  if (texture) return texture;

  const canvas = document.createElement('canvas');
  texture = createCharTexture(char, color, canvas);
  textureCache.set(key, texture);
  return texture;
}
