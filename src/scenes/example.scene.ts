import { Scene } from '@/core/scene';
import { Assets, Container, Graphics, Point, Sprite } from 'pixi.js';
import { Random } from '@/core/random';
import { AppRenderer } from '@/core/renderer';
import { Time } from '@/core/time';
import { CommonKeys, InputManager } from '@/core/input-manager';

const SQUARE_COLORS = [
  0xffff00, 0xff0000, 0x00ff00, 0x0000ff, 0x00ffff, 0xff00ff,
];

export class ExampleScene implements Scene {
  stage: Container = new Container();

  private square?: Graphics;
  private logo?: Sprite;
  private speed: number = 256;
  private velocity: Point = new Point(0, 0);

  async load(): Promise<Scene> {
    this.square = new Graphics();

    this.buildSquare();

    this.square.position.set(
      Random.shared.intRange(0, AppRenderer.shared.width - 64),
      Random.shared.intRange(0, AppRenderer.shared.height - 64),
    );

    // random diagonal
    this.velocity.set(
      ...Random.shared.choice([
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]),
    );

    this.stage.addChild(this.square);

    // Load the logo as a texture so we can use it in a sprite
    Assets.add({
      alias: 'logo',
      src: '/vite.svg',
    });
    const texture = await Assets.load('logo');
    this.logo = new Sprite(texture);
    this.logo.anchor.set(0.5, 0.5);
    this.stage.addChild(this.logo);

    return Promise.resolve(this);
  }

  private buildSquare(): void {
    if (!this.square) {
      return;
    }
    this.square.rect(0, 0, 64, 64);
    this.square.fill(Random.shared.choice(SQUARE_COLORS));
  }

  update(): void {
    const { width, height } = AppRenderer.shared;

    if (this.logo) {
      // center the logo
      this.logo.position.set(width / 2, height / 2);
      // rotate the logo
      this.logo.rotation += Math.PI * Time.deltaTime;
    }

    if (!this.square) {
      return;
    }

    if (InputManager.instance.keyPressed(CommonKeys.Space)) {
      this.buildSquare();
    }

    this.square.position.set(
      this.square.position.x + this.velocity.x * this.speed * Time.deltaTime,
      this.square.position.y + this.velocity.y * this.speed * Time.deltaTime,
    );

    if (this.square.position.x + this.square.width >= width) {
      this.velocity.set(-this.velocity.x, this.velocity.y);
    } else if (this.square.position.x <= 0) {
      this.velocity.set(-this.velocity.x, this.velocity.y);
    }
    if (this.square.position.y + this.square.height >= height) {
      this.velocity.set(this.velocity.x, -this.velocity.y);
    } else if (this.square.position.y <= 0) {
      this.velocity.set(this.velocity.x, -this.velocity.y);
    }
  }
}
