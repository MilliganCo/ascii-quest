import type { GameState } from './GameState';

const SAVE_KEY = 'ascii-quest-save';

export interface SavedState {
  playerPosition: { x: number; y: number };
  playerHp: number;
  playerMaxHp: number;
}

function isValidSavedState(obj: unknown): obj is SavedState {
  if (obj === null || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.playerPosition !== 'object' || o.playerPosition === null) return false;
  const pos = o.playerPosition as Record<string, unknown>;
  if (typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
  if (typeof o.playerHp !== 'number' || o.playerHp < 0) return false;
  if (typeof o.playerMaxHp !== 'number' || o.playerMaxHp <= 0) return false;
  return true;
}

export function save(state: GameState): void {
  const payload: SavedState = {
    playerPosition: { ...state.playerPosition },
    playerHp: state.playerHp,
    playerMaxHp: state.playerMaxHp,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function load(): SavedState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSavedState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clear(): void {
  localStorage.removeItem(SAVE_KEY);
}
