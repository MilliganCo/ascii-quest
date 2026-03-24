import { getChunkCoords, getEnemiesInView } from './ChunkManager';
import type { GameState } from './GameState';

const ATTACK_RANGE = 2;
const ATTACK_COOLDOWN_MS = 500;
const PLAYER_DAMAGE = 10;

export function updateCombat(state: GameState): void {
  if (state.isMoving) return;

  const now = performance.now();
  const lastAttack = state.lastAttackTime ?? 0;
  if (now - lastAttack < ATTACK_COOLDOWN_MS) return;

  const px = state.playerPosition.x;
  const py = state.playerPosition.y;
  const { cx, cy } = getChunkCoords(px, py);
  const enemies = getEnemiesInView(cx - 1, cx + 1, cy - 1, cy + 1);
  const alive = enemies.filter((e) => e.hp > 0);

  let nearest: { enemy: (typeof alive)[0]; dist: number } | null = null;
  for (const e of alive) {
    const dist = Math.sqrt((e.position.x - px) ** 2 + (e.position.y - py) ** 2);
    if (dist <= ATTACK_RANGE && (nearest === null || dist < nearest.dist)) {
      nearest = { enemy: e, dist };
    }
  }

  if (nearest !== null) {
    nearest.enemy.hp -= PLAYER_DAMAGE;
    state.lastAttackTime = now;
  }
}
