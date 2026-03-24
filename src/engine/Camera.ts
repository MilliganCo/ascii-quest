import type { Vec2 } from '../types';

export class Camera {
  target: Vec2;
  position: Vec2;
  lerp: number;

  constructor(options?: { target?: Vec2; position?: Vec2; lerp?: number }) {
    this.target = options?.target ?? { x: 0, y: 0 };
    this.position = options?.position ?? { ...this.target };
    this.lerp = options?.lerp ?? 0.1;
  }

  update(_dt: number): void {
    this.position.x += (this.target.x - this.position.x) * this.lerp;
    this.position.y += (this.target.y - this.position.y) * this.lerp;
  }

  follow(target: Vec2): void {
    this.target = target;
  }
}
