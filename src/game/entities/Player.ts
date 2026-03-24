import type { Vec2 } from '../../types';

export const PLAYER_CHAR = '@';
export const PLAYER_COLOR = '#c9b896';

export interface Player {
  position: Vec2;
  hp: number;
  maxHp: number;
}
