import './style.css';
import { createApplication } from './engine/Application';
import { createWorldContainer, updateWorldView } from './engine/WorldRenderer';
import { Camera } from './engine/Camera';
import { setupSlideInput } from './input/SlideInput';
import { setupKeyboardInput } from './input/KeyboardInput';
import { updateMovement } from './game/MovementSystem';
import { updateCombat } from './game/CombatSystem';
import { updateEnemyAI } from './game/EnemyAI';
import { createAbilityButtons } from './ui/AbilityButtons';
import { createHUD, updateHUD } from './ui/HUD';
import { worldToScreen, screenToWorld } from './engine/isometry';
import type { GameState } from './game/GameState';
import { load as loadSave, save as saveGame } from './game/SaveManager';

const app = document.getElementById('app')!;
const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
app.appendChild(canvas);

const abilityButtons = createAbilityButtons();
app.appendChild(abilityButtons);

const saved = loadSave();
const state: GameState = saved
  ? {
      playerPosition: saved.playerPosition,
      playerHp: saved.playerHp,
      playerMaxHp: saved.playerMaxHp,
      isMoving: false,
      moveDirection: null,
      moveTarget: null,
      moveSpeed: 2,
    }
  : {
      playerPosition: { x: 0, y: 0 },
      playerHp: 100,
      playerMaxHp: 100,
      isMoving: false,
      moveDirection: null,
      moveTarget: null,
      moveSpeed: 2,
    };

setupSlideInput(app, {
  onSlideMove: (dir) => {
    state.moveTarget = null;
    state.moveDirection = dir;
    state.isMoving = true;
  },
  onTap: () => {
    state.moveDirection = null;
    state.isMoving = false;
  },
  onSlideEnd: () => {
    // Keep moving in last direction until tap
  },
});

setupKeyboardInput({
  onMoveDirectionChange: (dir) => {
    state.moveTarget = null;
    state.moveDirection = dir;
    state.isMoving = dir !== null;
  },
});

(async () => {
  const pixi = await createApplication(canvas);
  console.log('PixiJS ready');
  const camera = new Camera();

  const hud = createHUD();
  document.body.appendChild(hud);

  const worldContainer = createWorldContainer();
  pixi.stage.addChild(worldContainer);

  canvas.addEventListener('click', (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const camScreen = worldToScreen(camera.position);
    const screenPos = {
      x: localX - pixi.screen.width / 2 + camScreen.x,
      y: localY - pixi.screen.height / 2 + camScreen.y,
    };
    const worldPos = screenToWorld(screenPos);
    state.moveTarget = { x: worldPos.x + 0.5, y: worldPos.y + 0.5 };
    state.isMoving = true;
  });

  pixi.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000;
    updateMovement(state, dt);
    updateCombat(state);
    updateEnemyAI(state, dt);
    camera.follow(state.playerPosition);
    camera.update(ticker.deltaTime);
    updateWorldView(
      worldContainer,
      camera.position.x,
      camera.position.y,
      pixi.screen.width,
      pixi.screen.height,
      state.playerPosition
    );
    updateHUD(hud, state);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveGame(state);
    }
  });
})();
