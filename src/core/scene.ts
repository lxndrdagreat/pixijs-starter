import { Subscribable } from "@/core/subscribable";
import type { Container } from "pixi.js";

export interface Scene {
	stage: Container;
	update: () => void;
}

export interface SceneLoader<SceneToLoad extends Scene = Scene> {
	load: () => Promise<SceneToLoad>;
}

export class SceneManager {
	private static _instance: SceneManager;
	private _sceneStack: Scene[] = [];

	onSceneLoading: Subscribable<Promise<Scene>> = new Subscribable<Promise<Scene>>();
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

	async replace<SceneToLoad extends Scene>(sceneLoader: SceneLoader<SceneToLoad>): Promise<Scene> {
		this._sceneStack = [];
		return this.push(sceneLoader);
	}

	async push<SceneToLoad extends Scene>(sceneLoader: SceneLoader<SceneToLoad>): Promise<SceneToLoad> {
		const loadPromise = sceneLoader.load();
		this.onSceneLoading.publish(loadPromise);
		const scene = await loadPromise;
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
