# ASCII Quest Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Веб-игра ASCII Quest — action-adventure в изометрическом 2.5D мире с процедурной генерацией, PixiJS, управлением одной рукой на мобильных (slide-to-move, auto-attack).

**Architecture:** PixiJS рендерит ASCII-спрайты в изометрической сетке. Chunk-based мир с процедурной генерацией. GameState как единый источник истины. Input → GameLogic → GameState → Renderer.

**Tech Stack:** Vite, TypeScript, PixiJS v8, HTML/CSS для UI.

**Design Reference:** `docs/plans/2025-02-27-ascii-quest-design.md`

---

## Phase 1: Project Setup & Engine Foundation

### Task 1: Инициализация проекта Vite + TypeScript

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`

**Step 1: Create package.json**

```json
{
  "name": "ascii-quest",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pixi.js": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
});
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>ASCII Quest</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 5: Install dependencies**

Run: `npm install`  
Expected: Dependencies installed without error.

**Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: init Vite + TypeScript project"
```

---

### Task 2: Базовая структура и точка входа

**Files:**
- Create: `src/main.ts`
- Create: `src/types.ts`

**Step 1: Create src/types.ts**

```typescript
export type TileType = 'grass' | 'stone' | 'water' | 'tree';

export interface Vec2 {
  x: number;
  y: number;
}

export interface ChunkData {
  tiles: TileType[][];
  chunkX: number;
  chunkY: number;
}
```

**Step 2: Create src/main.ts**

```typescript
import './style.css';

const app = document.getElementById('app')!;
app.innerHTML = '<canvas id="game-canvas"></canvas>';
```

**Step 3: Create src/style.css**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%; height: 100%;
  overflow: hidden;
}
#game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

**Step 4: Run dev server**

Run: `npm run dev`  
Expected: Server starts, no errors in console. Page loads.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add base structure and entry point"
```

---

### Task 3: PixiJS Application и Canvas mount

**Files:**
- Create: `src/engine/Application.ts`
- Modify: `src/main.ts`

**Step 1: Create src/engine/Application.ts**

```typescript
import { Application as PIXIApp } from 'pixi.js';

export function createApplication(canvas: HTMLCanvasElement): PIXIApp {
  const app = new PIXIApp();
  app.init({ canvas, resizeTo: window, background: '#2a2a2a' });
  return app;
}
```

**Step 2: Modify src/main.ts**

```typescript
import './style.css';
import { createApplication } from './engine/Application';

const app = document.getElementById('app')!;
const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
app.appendChild(canvas);

const pixi = createApplication(canvas);
console.log('PixiJS ready', pixi);
```

**Step 3: Verify**

Run: `npm run dev`, open browser. Expected: Dark gray canvas, "PixiJS ready" in console.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add PixiJS application with canvas resize"
```

---

### Task 4: Изометрические утилиты координат

**Files:**
- Create: `src/engine/isometry.ts`
- Create: `src/engine/isometry.test.ts` (optional, if Jest/vitest added later)

**Step 1: Create src/engine/isometry.ts**

```typescript
import type { Vec2 } from '../types';

const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;

export function worldToScreen(world: Vec2): Vec2 {
  return {
    x: (world.x - world.y) * (TILE_WIDTH / 2),
    y: (world.x + world.y) * (TILE_HEIGHT / 2),
  };
}

export function screenToWorld(screen: Vec2): Vec2 {
  const x = (screen.x / (TILE_WIDTH / 2) + screen.y / (TILE_HEIGHT / 2)) / 2;
  const y = (screen.y / (TILE_HEIGHT / 2) - screen.x / (TILE_WIDTH / 2)) / 2;
  return { x: Math.floor(x), y: Math.floor(y) };
}

export function getTileDimensions() {
  return { width: TILE_WIDTH, height: TILE_HEIGHT };
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add isometric coordinate conversion utilities"
```

---

### Task 5: Bitmap font / ASCII texture и рендер тайла

**Files:**
- Create: `src/engine/AsciiTexture.ts`
- Create: `src/engine/TileRenderer.ts`

**Step 1: Create src/engine/AsciiTexture.ts**

Рендерит текстуру с одним символом через Canvas 2D, затем загружает в PixiJS.

```typescript
import { Texture, utils } from 'pixi.js';

const CHAR_SIZE = 16;
const FONT = '14px monospace';

export function createCharTexture(
  char: string,
  color: string,
  canvas: HTMLCanvasElement
): Texture {
  const ctx = canvas.getContext('2d')!;
  canvas.width = CHAR_SIZE;
  canvas.height = CHAR_SIZE;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CHAR_SIZE, CHAR_SIZE);
  ctx.font = FONT;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, CHAR_SIZE / 2, CHAR_SIZE / 2);
  return Texture.from(canvas);
}

const canvas = document.createElement('canvas');
const textureCache = new Map<string, Texture>();

export function getCharTexture(char: string, color: string): Texture {
  const key = `${char}:${color}`;
  if (!textureCache.has(key)) {
    textureCache.set(key, createCharTexture(char, color, canvas));
  }
  return textureCache.get(key)!;
}
```

**Step 2: Create src/engine/TileRenderer.ts**

```typescript
import { Container, Sprite } from 'pixi.js';
import { worldToScreen, getTileDimensions } from './isometry';
import { getCharTexture } from './AsciiTexture';
import type { Vec2 } from '../types';
import type { TileType } from '../types';

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

export function createTileSprite(tileType: TileType, worldPos: Vec2): Sprite {
  const char = TILE_CHARS[tileType];
  const color = TILE_COLORS[tileType];
  const texture = getCharTexture(char, color);
  const sprite = new Sprite({ texture });
  const screen = worldToScreen(worldPos);
  const { width, height } = getTileDimensions();
  sprite.anchor.set(0.5, 1);
  sprite.x = screen.x;
  sprite.y = screen.y;
  sprite.width = width;
  sprite.height = height;
  return sprite;
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add ASCII texture cache and tile renderer"
```

---

## Phase 2: World & Procedural Generation

### Task 6: Procedural chunk generator (noise-based)

**Files:**
- Create: `src/procedural/noise.ts` (simplified Perlin-like or use seed random)
- Create: `src/procedural/ChunkGenerator.ts`

**Step 1: Create src/procedural/noise.ts**

Упрощённый deterministic pseudo-random для генерации без внешних библиотек.

```typescript
export function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

export function noise2D(x: number, y: number, seed: number): number {
  const r = seededRandom((x * 73856093) ^ (y * 19349663) ^ seed);
  return r();
}
```

**Step 2: Create src/procedural/ChunkGenerator.ts**

```typescript
import type { ChunkData, TileType } from '../types';
import { noise2D } from './noise';

const CHUNK_SIZE = 32;
const WORLD_SEED = 12345;

export function generateChunk(chunkX: number, chunkY: number): ChunkData {
  const tiles: TileType[][] = [];
  for (let dy = 0; dy < CHUNK_SIZE; dy++) {
    tiles[dy] = [];
    for (let dx = 0; dx < CHUNK_SIZE; dx++) {
      const wx = chunkX * CHUNK_SIZE + dx;
      const wy = chunkY * CHUNK_SIZE + dy;
      const height = noise2D(wx * 0.05, wy * 0.05, WORLD_SEED);
      const moisture = noise2D(wx * 0.07 + 100, wy * 0.07, WORLD_SEED);
      let tile: TileType = 'grass';
      if (height < 0.3) tile = 'water';
      else if (height > 0.7) tile = 'stone';
      else if (moisture > 0.6) tile = 'tree';
      tiles[dy][dx] = tile;
    }
  }
  return { tiles, chunkX, chunkY };
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add procedural chunk generator with noise"
```

---

### Task 7: Chunk manager и World state

**Files:**
- Create: `src/game/ChunkManager.ts`
- Create: `src/game/GameState.ts`

**Step 1: Create src/game/GameState.ts**

```typescript
import type { Vec2 } from '../types';

export interface GameState {
  playerPosition: Vec2;
  playerHp: number;
  playerMaxHp: number;
  isMoving: boolean;
  moveDirection: Vec2 | null;
}
```

**Step 2: Create src/game/ChunkManager.ts**

```typescript
import type { ChunkData } from '../types';
import { generateChunk } from '../procedural/ChunkGenerator';

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
  const CHUNK_SIZE = 32;
  return {
    cx: Math.floor(worldX / CHUNK_SIZE),
    cy: Math.floor(worldY / CHUNK_SIZE),
  };
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add ChunkManager and GameState"
```

---

### Task 8: World renderer (chunks + viewport culling)

**Files:**
- Create: `src/engine/WorldRenderer.ts`
- Modify: `src/main.ts`

**Step 1: Create src/engine/WorldRenderer.ts**

```typescript
import { Container } from 'pixi.js';
import { getChunk, getChunkCoords } from '../game/ChunkManager';
import { createTileSprite } from './TileRenderer';
import type { TileType } from '../types';
import { getTileDimensions, worldToScreen } from './isometry';

const CHUNK_SIZE = 32;

export function createWorldContainer(): Container {
  return new Container();
}

export function updateWorldView(
  worldContainer: Container,
  cameraWorldX: number,
  cameraWorldY: number,
  viewWidth: number,
  viewHeight: number
): void {
  worldContainer.removeChildren();
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
      const tile = chunk.tiles[ly]?.[lx] ?? 'grass';
      const sprite = createTileSprite(tile as TileType, { x: wx, y: wy });
      worldContainer.addChild(sprite);
    }
  }
}
```

**Step 2: Wire up in main.ts** (minimal integration — will be expanded in Task 9)

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add WorldRenderer with viewport culling"
```

---

### Task 9: Камера и игровой цикл

**Files:**
- Create: `src/engine/Camera.ts`
- Modify: `src/main.ts`

**Step 1: Create src/engine/Camera.ts**

```typescript
import type { Vec2 } from '../types';

export class Camera {
  target: Vec2 = { x: 0, y: 0 };
  position: Vec2 = { x: 0, y: 0 };
  lerp = 0.1;

  update(dt: number): void {
    this.position.x += (this.target.x - this.position.x) * this.lerp;
    this.position.y += (this.target.y - this.position.y) * this.lerp;
  }

  follow(target: Vec2): void {
    this.target = target;
  }
}
```

**Step 2: Modify src/main.ts** — add game loop, camera, world renderer, initial player at (0,0). Call updateWorldView each frame with camera position.

**Step 3: Verify**

Run `npm run dev`. Expected: Isometric world visible, camera centered on origin. Procedural grass/water/stone/trees.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add camera and game loop with world render"
```

---

## Phase 3: Player & Input

### Task 10: Player entity и рендер

**Files:**
- Create: `src/game/entities/Player.ts`
- Modify: `src/engine/TileRenderer.ts` (add entity rendering)

**Step 1: Add entity char/color in TileRenderer or new EntityRenderer**

```typescript
export function createEntitySprite(char: string, color: string, worldPos: Vec2): Sprite {
  const texture = getCharTexture(char, color);
  const sprite = new Sprite({ texture });
  const screen = worldToScreen(worldPos);
  const { width, height } = getTileDimensions();
  sprite.anchor.set(0.5, 1);
  sprite.x = screen.x;
  sprite.y = screen.y;
  sprite.width = width;
  sprite.height = height;
  return sprite;
}
```

**Step 2: Create src/game/entities/Player.ts**

```typescript
import type { Vec2 } from '../../types';

export const PLAYER_CHAR = '@';
export const PLAYER_COLOR = '#c9b896';

export interface Player {
  position: Vec2;
  hp: number;
  maxHp: number;
}
```

**Step 3: Add player sprite to WorldRenderer update** (or separate layer). Render player on top of tiles, sort by Y.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Player entity and render"
```

---

### Task 11: Slide-to-move input (touch)

**Files:**
- Create: `src/input/SlideInput.ts`

**Step 1: Create src/input/SlideInput.ts**

```typescript
import type { Vec2 } from '../types';

export interface SlideInputCallbacks {
  onSlideStart?: () => void;
  onSlideMove?: (direction: Vec2) => void;
  onSlideEnd?: () => void;
  onTap?: () => void;
}

const TAP_THRESHOLD_MS = 200;
const TAP_THRESHOLD_PX = 10;

export function setupSlideInput(
  element: HTMLElement,
  callbacks: SlideInputCallbacks
): void {
  let startX = 0, startY = 0, startTime = 0;

  const handleStart = (e: TouchEvent | MouseEvent) => {
    const t = e instanceof TouchEvent ? e.touches[0] : e;
    startX = t.clientX;
    startY = t.clientY;
    startTime = Date.now();
    callbacks.onSlideStart?.();
  };

  const handleMove = (e: TouchEvent | MouseEvent) => {
    const t = e instanceof TouchEvent ? e.touches[0] : e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 5) {
      callbacks.onSlideMove?.({ x: dx / len, y: dy / len });
    }
  };

  const handleEnd = () => {
    const elapsed = Date.now() - startTime;
    const isTap = elapsed < TAP_THRESHOLD_MS;
    if (isTap) callbacks.onTap?.();
    else callbacks.onSlideEnd?.();
  };

  element.addEventListener('touchstart', handleStart, { passive: true });
  element.addEventListener('touchmove', handleMove, { passive: true });
  element.addEventListener('touchend', handleEnd);
  element.addEventListener('mousedown', handleStart);
  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseup', handleEnd);
}
```

**Step 2: Wire up in main — onSlideMove sets GameState.moveDirection, onTap clears it (stop).**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add slide-to-move and tap-to-stop input"
```

---

### Task 12: Player movement logic

**Files:**
- Modify: `src/game/GameState.ts`
- Create: `src/game/MovementSystem.ts`

**Step 1: Update GameState** — add moveDirection, moveSpeed, isMoving.

**Step 2: Create MovementSystem** — each frame: if moveDirection, add velocity to position; check collision with water/stone (block); update isMoving.

**Step 3: Integrate in game loop.**

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add player movement with collision"
```

---

## Phase 4: Combat & Enemies

### Task 13: Enemy entity и spawn

**Files:**
- Create: `src/game/entities/Enemy.ts`
- Modify: `src/procedural/ChunkGenerator.ts` (spawn enemies in chunk)

**Step 1: Create Enemy type** — position, hp, damage, dangerLevel (1–3 for color), char (g, o, O).

**Step 2: Add enemy spawn in ChunkGenerator** — place 0–2 enemies per chunk in grass areas.

**Step 3: Render enemies** — use color gradient red→purple by dangerLevel.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add enemy entities with procedural spawn"
```

---

### Task 14: Auto-attack when standing (archer.io-style)

**Files:**
- Create: `src/game/CombatSystem.ts`

**Step 1: CombatSystem** — if !isMoving, find nearest enemy in range (e.g. 2 tiles), attack cooldown (e.g. 500ms), apply damage to enemy, remove if hp<=0.

**Step 2: Integrate in game loop.**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add auto-attack when player stands still"
```

---

### Task 15: Enemy AI (chase player)

**Files:**
- Create: `src/game/EnemyAI.ts`

**Step 1: Simple chase** — if player in agro range (e.g. 8 tiles), move toward player. Simple path: step in direction of player, avoid water.

**Step 2: Enemy attack** — if adjacent to player, deal damage on cooldown.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add enemy chase and attack AI"
```

---

## Phase 5: UI & Polish

### Task 16: HUD (HP bar)

**Files:**
- Create: `src/ui/HUD.ts`

**Step 1: HTML overlay** — HP bar (progress bar style), position top-left, muted colors per design.

**Step 2: Update from GameState each frame.**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add HUD with HP bar"
```

---

### Task 17: Ability buttons (placeholder)

**Files:**
- Create: `src/ui/AbilityButtons.ts`

**Step 1: 1–3 buttons** in corner, touch-friendly. Placeholder handlers (console.log). Show cooldown overlay.

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add ability button placeholders"
```

---

### Task 18: Desktop controls (WASD / click-to-move)

**Files:**
- Create: `src/input/KeyboardInput.ts`

**Step 1: WASD** sets moveDirection. Click on ground → pathfind or move toward (simplified: set target, move toward).

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add keyboard and click-to-move for desktop"
```

---

### Task 19: Save/Load (localStorage)

**Files:**
- Create: `src/game/SaveManager.ts`

**Step 1: Serialize** player position, HP, chunk cache (or seed + visited chunks). Save on visibilitychange 'hidden'. Load on startup.

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add localStorage save/load"
```

---

### Task 20: WebGL fallback и mobile tweaks

**Files:**
- Modify: `src/engine/Application.ts`
- Modify: `src/style.css`

**Step 1: Try WebGL, fallback to Canvas2D** if init fails.

**Step 2: Prevent overscroll, touch-action, prevent zoom on double-tap** for mobile.

**Step 3: Commit**

```bash
git add .
git commit -m "chore: add WebGL fallback and mobile UX tweaks"
```

---

## Execution Handoff

**Plan complete and saved to `docs/plans/2025-02-27-ascii-quest-implementation.md`**

**Два варианта исполнения:**

1. **Subagent-Driven (в этой сессии)** — запускаю subagent на каждую задачу, проверяю между задачами, быстрая итерация.
2. **Отдельная сессия** — открыть новую сессию с executing-plans, выполнять батчами с чекпоинтами.

**Какой вариант предпочитаете?**
