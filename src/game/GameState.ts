import type { Vec2 } from '../types';

export interface GameState {
  playerPosition: Vec2;
  playerHp: number;
  playerMaxHp: number;
  isMoving: boolean;
  moveDirection: Vec2 | null;
  moveTarget: Vec2 | null;
  moveSpeed: number;
  lastAttackTime?: number;
}
