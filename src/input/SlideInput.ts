import type { Vec2 } from '../types';

const TAP_THRESHOLD_MS = 200;
const TAP_THRESHOLD_PX = 10;
const MOVE_THRESHOLD_PX = 5;

export interface SlideInputCallbacks {
  onSlideStart?: () => void;
  onSlideMove?: (direction: Vec2) => void;
  onSlideEnd?: () => void;
  onTap?: () => void;
}

function getPosition(e: TouchEvent | MouseEvent): { x: number; y: number } {
  if ('touches' in e) {
    return { x: e.touches[0]?.clientX ?? 0, y: e.touches[0]?.clientY ?? 0 };
  }
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
}

export function setupSlideInput(
  element: HTMLElement,
  callbacks: SlideInputCallbacks
): void {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let lastX = 0;
  let lastY = 0;
  let isPointerDown = false;

  const handleStart = (e: TouchEvent | MouseEvent) => {
    const pos = getPosition(e);
    startX = pos.x;
    startY = pos.y;
    lastX = pos.x;
    lastY = pos.y;
    startTime = Date.now();
    isPointerDown = true;
    callbacks.onSlideStart?.();
  };

  const handleMove = (e: TouchEvent | MouseEvent) => {
    if (!isPointerDown) return;
    const pos = getPosition(e);
    lastX = pos.x;
    lastY = pos.y;
    const dx = pos.x - startX;
    const dy = pos.y - startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > MOVE_THRESHOLD_PX) {
      callbacks.onSlideMove?.({ x: dx / len, y: dy / len });
    }
  };

  const handleEnd = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    const elapsed = Date.now() - startTime;
    const dx = lastX - startX;
    const dy = lastY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (elapsed < TAP_THRESHOLD_MS && distance < TAP_THRESHOLD_PX) {
      callbacks.onTap?.();
    } else {
      callbacks.onSlideEnd?.();
    }
  };

  // Touch events
  element.addEventListener('touchstart', handleStart as EventListener, {
    passive: true,
  });
  element.addEventListener('touchmove', handleMove as EventListener, {
    passive: true,
  });
  element.addEventListener('touchend', handleEnd);
  element.addEventListener('touchcancel', handleEnd);

  // Mouse events
  element.addEventListener('mousedown', handleStart as EventListener);
  element.addEventListener('mousemove', handleMove as EventListener);
  element.addEventListener('mouseup', handleEnd);
  element.addEventListener('mouseleave', handleEnd);
}
