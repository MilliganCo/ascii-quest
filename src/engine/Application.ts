import { Application } from 'pixi.js';

const BASE_OPTIONS = {
  resizeTo: window,
  background: '#2a2a2a',
} as const;

export async function createApplication(canvas: HTMLCanvasElement): Promise<Application> {
  const app = new Application();
  try {
    await app.init({ canvas, ...BASE_OPTIONS, preference: 'webgl' });
    return app;
  } catch {
    const fallback = new Application();
    await fallback.init({ canvas, ...BASE_OPTIONS, preference: 'canvas' });
    return fallback;
  }
}
