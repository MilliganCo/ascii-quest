import type { GameState } from '../game/GameState';

export function createHUD(): HTMLDivElement {
  const hud = document.createElement('div');
  hud.id = 'hud';
  Object.assign(hud.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    padding: '8px',
    zIndex: '100',
    pointerEvents: 'none',
  });

  const hpLabel = document.createElement('div');
  hpLabel.textContent = 'HP 100/100';
  hpLabel.dataset.hud = 'hp-label';
  hpLabel.style.cssText = 'font-size: 12px; color: #ccc; margin-bottom: 4px; font-family: monospace;';

  const hpBarOuter = document.createElement('div');
  hpBarOuter.style.cssText = `
    width: 120px;
    height: 12px;
    background: #3a3a3a;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #4a4a4a;
  `;

  const hpBarFill = document.createElement('div');
  hpBarFill.dataset.hud = 'hp-fill';
  hpBarFill.style.cssText = `
    height: 100%;
    width: 100%;
    background: #9a8a7a;
    border-radius: 3px;
    transition: width 0.15s ease-out;
  `;

  hpBarOuter.appendChild(hpBarFill);
  hud.appendChild(hpLabel);
  hud.appendChild(hpBarOuter);

  return hud;
}

export function updateHUD(element: HTMLDivElement, state: GameState): void {
  const hpLabel = element.querySelector<HTMLDivElement>('[data-hud="hp-label"]');
  const hpBarFill = element.querySelector<HTMLDivElement>('[data-hud="hp-fill"]');
  if (!hpLabel || !hpBarFill) return;

  const { playerHp, playerMaxHp } = state;
  const pct = playerMaxHp > 0 ? Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100)) : 0;

  hpLabel.textContent = `HP ${Math.round(playerHp)}/${playerMaxHp}`;
  hpBarFill.style.width = `${pct}%`;
}
