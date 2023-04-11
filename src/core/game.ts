import {
  autoDetectRenderer,
  Container,
  IRendererOptionsAuto,
  Renderer,
} from 'pixi.js';
import { Time } from './time';
import { InputManager } from './input-manager';
import Stats from 'stats.js';
import { AppRenderer } from './renderer';
import { Scene, SceneManager } from './scene';

interface GameOptions {
  frame: HTMLElement;
  renderOptions?: Partial<IRendererOptionsAuto>;
  initialScene?: Scene;
  pauseWhenHidden?: boolean;
}

const DEFAULT_RENDER_OPTIONS: Partial<IRendererOptionsAuto> = {
  width: 1280,
  height: 768,
};

export default class Game {
  private frame: HTMLElement;
  private renderer: Renderer;
  private stage: Container;
  private lastFrame: number = 0;
  private _stats?: Stats;
  private activeScene: Scene | null = null;
  private pauseWhenHidden: boolean = true;

  constructor(options: GameOptions) {
    this.frame = options.frame;
    if (options.hasOwnProperty('pauseWhenHidden')) {
      this.pauseWhenHidden = !!options.pauseWhenHidden;
    }

    const { renderOptions = DEFAULT_RENDER_OPTIONS } = options;

    this.renderer = autoDetectRenderer(renderOptions) as Renderer;
    AppRenderer.shared = this.renderer;

    this.stage = new Container();

    SceneManager.instance.onActiveSceneChanged.subscribe((scene) => {
      this.activeScene = scene;
      this.stage.removeChildren();
      if (scene) {
        this.stage.addChild(scene.stage);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (this.pauseWhenHidden) {
        Time.paused = document.hidden;
        if (!document.hidden) {
          // reset time
          this.lastFrame = 0;
        }
      }
    });

    if (import.meta.env.MODE === 'development') {
      this._stats = new Stats();
      this._stats.showPanel(1);
      document.body.appendChild(this._stats.dom);
    }

    if (!!options.initialScene) {
      SceneManager.instance.push(options.initialScene);
    }

    requestAnimationFrame(this.tick.bind(this));
    this.frame.appendChild(this.renderer.view as HTMLCanvasElement);
  }

  private update(): void {
    if (this.activeScene) {
      this.activeScene.update();
    }
  }

  private tick(time: number): void {
    if (this._stats) {
      this._stats.begin();
    }
    if (!this.lastFrame) {
      this.lastFrame = time;
    }
    let delta = (time - this.lastFrame) * 0.001;
    Time.deltaTime = Time.frameRate;
    this.lastFrame = time;

    if (!Time.paused) {
      // This produces a fixed-time step
      while (delta >= Time.frameRate) {
        this.update();
        delta -= Time.frameRate;
      }
    }

    this.renderer.render(this.stage, {
      clear: true,
    });

    // flush input
    InputManager.instance.flush();

    if (this._stats) {
      this._stats.end();
    }

    // queue next frame
    requestAnimationFrame(this.tick.bind(this));
  }
}
