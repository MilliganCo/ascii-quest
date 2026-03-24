import type { Vec2 } from '../types';

const WASD_KEYS = new Set<string>(['KeyW', 'KeyA', 'KeyS', 'KeyD']);

const KEY_TO_VEC: Record<string, Vec2> = {
  KeyW: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

function computeDirectionFromKeys(keys: Set<string>): Vec2 | null {
  let dx = 0;
  let dy = 0;
  for (const key of keys) {
    const vec = KEY_TO_VEC[key];
    if (vec) {
      dx += vec.x;
      dy += vec.y;
    }
  }
  if (dx === 0 && dy === 0) return null;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  return { x: dx / len, y: dy / len };
}

export interface KeyboardInputCallbacks {
  onKeyDown?: (key: string) => void;
  onKeyUp?: (key: string) => void;
  onMoveDirectionChange?: (dir: Vec2 | null) => void;
}

export function setupKeyboardInput(
  callbacks: KeyboardInputCallbacks = {}
): () => void {
  const pressedKeys = new Set<string>();

  const updateDirection = () => {
    const dir = computeDirectionFromKeys(pressedKeys);
    callbacks.onMoveDirectionChange?.(dir);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    callbacks.onKeyDown?.(e.code);
    if (WASD_KEYS.has(e.code)) {
      pressedKeys.add(e.code);
      updateDirection();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    callbacks.onKeyUp?.(e.code);
    if (WASD_KEYS.has(e.code)) {
      pressedKeys.delete(e.code);
      updateDirection();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}
