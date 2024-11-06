import type { Container } from 'pixi.js';
import { Subscribable } from '@/core/subscribable';

export interface Scene {
  stage: Container;
  load: () => Promise<Scene>;
  update: () => void;
}

export class SceneManager {
  private static _instance: SceneManager;
  private _sceneStack: Scene[] = [];

  onSceneLoad: Subscribable<Scene> = new Subscribable<Scene>();
  onSceneLoaded: Subscribable<Scene> = new Subscribable<Scene>();
  onActiveSceneChanged: Subscribable<Scene | null> =
    new Subscribable<Scene | null>();

  static get instance(): SceneManager {
    if (!SceneManager._instance) {
      SceneManager._instance = new SceneManager();
    }
    return SceneManager._instance;
  }

  get activeScene(): Scene | null {
    if (!this._sceneStack.length) {
      return null;
    }
    return this._sceneStack[0];
  }

  async replace(scene: Scene): Promise<Scene> {
    this._sceneStack = [];
    return this.push(scene);
  }

  async push(scene: Scene): Promise<Scene> {
    this.onSceneLoad.publish(scene);
    await scene.load();
    this.onSceneLoaded.publish(scene);
    this.onActiveSceneChanged.publish(scene);
    this._sceneStack.unshift(scene);
    return scene;
  }

  pop(): void {
    if (!this._sceneStack.length) {
      return;
    }
    this._sceneStack.shift();
    if (!this._sceneStack.length) {
      this.onActiveSceneChanged.publish(null);
    } else {
      this.onActiveSceneChanged.publish(this._sceneStack[0]);
    }
  }

  popAll(): void {
    this._sceneStack = [];
    this.onActiveSceneChanged.publish(null);
  }
}
