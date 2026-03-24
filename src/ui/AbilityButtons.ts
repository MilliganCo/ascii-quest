/**
 * Creates a container with 1-3 ability buttons as placeholders.
 * Positioned fixed bottom-right, touch-friendly (min 44x44px).
 */
export function createAbilityButtons(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'ability-buttons';
  container.style.cssText = `
    position: fixed;
    bottom: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    flex-direction: row-reverse;
    z-index: 100;
  `;

  const abilities = [
    { id: 1, label: '1' },
    { id: 2, label: '2' },
    { id: 3, label: '3' },
  ];

  for (const ability of abilities) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = ability.label;
    btn.style.cssText = `
      min-width: 44px;
      min-height: 44px;
      border: 1px solid rgba(128, 128, 128, 0.5);
      border-radius: 8px;
      background: rgba(64, 64, 64, 0.8);
      color: rgba(200, 200, 200, 0.9);
      font-size: 16px;
      cursor: pointer;
      transition: background 0.15s ease;
    `;
    btn.addEventListener('click', () => {
      console.log(`Ability ${ability.id}`);
    });
    btn.addEventListener('pointerenter', () => {
      btn.style.background = 'rgba(80, 80, 80, 0.9)';
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.background = 'rgba(64, 64, 64, 0.8)';
    });
    container.appendChild(btn);
  }

  return container;
}
