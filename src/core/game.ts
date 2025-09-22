import {
	type AutoDetectOptions,
	autoDetectRenderer,
	Container,
	type Renderer,
} from "pixi.js";
import Stats from "stats.js";
import AppRenderer, { ASPECT_RATIO_RESOLUTIONS } from "@/core/appRenderer";
import { InputManager } from "@/core/inputManager";
import { type ISceneLoader, type Scene, SceneManager } from "@/core/scene";
import Time from "@/core/time";

interface GameOptions<T extends Scene = Scene> {
	frame: HTMLElement;
	renderOptions?: Partial<AutoDetectOptions>;
	initialScene?: ISceneLoader<T>;
	pauseWhenHidden?: boolean;
}

const DEFAULT_RENDER_OPTIONS: Partial<AutoDetectOptions> = {
	...ASPECT_RATIO_RESOLUTIONS.ASPECT_16_9.r1280x720,
	preference: "webgpu",
};

export default class Game {
	#frame: HTMLElement;
	#renderer: Renderer;
	#stage: Container;
	#lastFrame = 0;
	#stats?: Stats;
	#activeScene: Scene | null = null;
	#pauseWhenHidden = true;

	constructor(options: GameOptions, renderer: Renderer) {
		this.#frame = options.frame;
		if ("pauseWhenHidden" in options) {
			this.#pauseWhenHidden = !!options.pauseWhenHidden;
		}

		this.#renderer = renderer;
		AppRenderer.shared = this.#renderer;

		this.#stage = new Container();

		SceneManager.instance.onActiveSceneChanged.subscribe((scene) => {
			this.#activeScene = scene;
			this.#stage.removeChildren();
			if (scene) {
				this.#stage.addChild(scene.stage);
			}
		});

		document.addEventListener("visibilitychange", () => {
			if (this.#pauseWhenHidden) {
				Time.paused = document.hidden;
				if (!document.hidden) {
					// reset time
					this.#lastFrame = 0;
				}
			}
		});

		if (import.meta.env.MODE === "development") {
			this.#stats = new Stats();
			this.#stats.showPanel(1);
			document.body.appendChild(this.#stats.dom);
		}

		if (options.initialScene) {
			SceneManager.instance.push(options.initialScene);
		}

		requestAnimationFrame(this.tick.bind(this));
		this.#frame.appendChild(this.#renderer.canvas);
	}

	static async create(options: GameOptions): Promise<Game> {
		const { renderOptions = DEFAULT_RENDER_OPTIONS } = options;

		const renderer = await autoDetectRenderer(renderOptions);
		return new Game(options, renderer);
	}

	private update(): void {
		if (this.#activeScene) {
			this.#activeScene.update();
		}
	}

	private tick(time: number): void {
		if (this.#stats) {
			this.#stats.begin();
		}
		if (!this.#lastFrame) {
			this.#lastFrame = time;
		}
		let delta = (time - this.#lastFrame) * 0.001;
		Time.deltaTime = Time.frameRate;
		this.#lastFrame = time;

		if (!Time.paused) {
			// This produces a fixed-time step
			while (delta >= Time.frameRate) {
				this.update();
				delta -= Time.frameRate;
				// flush input
				InputManager.instance.flush();
			}
		}

		this.#renderer.render({
			clear: true,
			container: this.#stage,
		});

		if (this.#stats) {
			this.#stats.end();
		}

		// queue next frame
		requestAnimationFrame(this.tick.bind(this));
	}
}
