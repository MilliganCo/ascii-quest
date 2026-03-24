export interface Enemy {
  id: string;
  position: { x: number; y: number };
  hp: number;
  maxHp: number;
  damage: number;
  dangerLevel: 1 | 2 | 3;
  char: string;
  lastAttackTime?: number;
}

/** Red-to-purple gradient by danger level. Purple = most dangerous. */
export function getEnemyColor(dangerLevel: 1 | 2 | 3): string {
  switch (dangerLevel) {
    case 1:
      return '#8b6b6b';
    case 2:
      return '#7a5a7a';
    case 3:
      return '#4a3a5a';
    default:
      return '#8b6b6b';
  }
}

/** Character for each danger level: g, o, O */
export function getEnemyChar(dangerLevel: 1 | 2 | 3): string {
  switch (dangerLevel) {
    case 1:
      return 'g';
    case 2:
      return 'o';
    case 3:
      return 'O';
    default:
      return 'g';
  }
}
