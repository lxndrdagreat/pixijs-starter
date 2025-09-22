import { Container } from "pixi.js";
import { Subscribable } from "@/core/subscribable";

export interface ISceneLoader<SceneClass extends Scene> {
	/**
	 * Override this function. This is where you load and assets
	 * needed by the scene, then return a new instance of the scene
	 * class itself.
	 */
	load(): Promise<SceneClass>;
}

export class Scene {
	stage: Container = new Container();

	/**
	 * Override this function. This is where your scene's update
	 * logic is run every frame.
	 */
	update(): void {}

	/**
	 * Called when the scene is no longer active.
	 */
	unload(): void {}
}

export class SceneManager {
	private static _instance: SceneManager;
	private _sceneStack: Scene[] = [];

	onSceneLoading: Subscribable<Promise<Scene>> = new Subscribable<
		Promise<Scene>
	>();
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

	async replace<T extends Scene>(loader: ISceneLoader<T>): Promise<Scene> {
		for (const scene of this._sceneStack) {
			scene.unload();
		}
		this._sceneStack = [];
		return this.push(loader);
	}

	async push<T extends Scene>(loader: ISceneLoader<T>): Promise<Scene> {
		const loadPromise: Promise<Scene> = loader.load();
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
		const scene = this._sceneStack.shift();
		if (scene) {
			scene.unload();
		}
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
