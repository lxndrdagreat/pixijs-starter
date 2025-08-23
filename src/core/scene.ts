import { Container } from "pixi.js";
import { Subscribable } from "@/core/subscribable";

export class Scene {
	stage: Container = new Container();

	/**
	 * Override this function. This is where your scene's update
	 * logic is run every frame.
	 */
	update(): void {}

	/**
	 * Override this function. This is where you load and assets
	 * needed by the scene, then return a new instance of the scene
	 * class itself.
	 */
	static async load(): Promise<Scene> {
		return new Scene();
	}
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

	async replace(sceneClass: typeof Scene): Promise<Scene> {
		this._sceneStack = [];
		return this.push(sceneClass);
	}

	async push(sceneClass: typeof Scene): Promise<Scene> {
		const loadPromise = sceneClass.load();
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
