import AppRenderer, { ASPECT_RATIO_RESOLUTIONS } from "@/core/appRenderer";
import { InputManager } from "@/core/inputManager";
import { type Scene, SceneManager } from "@/core/scene";
import Time from "@/core/time";
import {
	type AutoDetectOptions,
	Container,
	type Renderer,
	autoDetectRenderer,
} from "pixi.js";
import Stats from "stats.js";

interface GameOptions {
	frame: HTMLElement;
	renderOptions?: Partial<AutoDetectOptions>;
	initialScene?: Scene;
	pauseWhenHidden?: boolean;
}

const DEFAULT_RENDER_OPTIONS: Partial<AutoDetectOptions> = {
	...ASPECT_RATIO_RESOLUTIONS.ASPECT_16_9.r1280x720,
	preference: "webgpu",
};

export default class Game {
	private frame: HTMLElement;
	private renderer: Renderer;
	private stage: Container;
	private lastFrame = 0;
	private _stats?: Stats;
	private activeScene: Scene | null = null;
	private pauseWhenHidden = true;

	constructor(options: GameOptions, renderer: Renderer) {
		this.frame = options.frame;
		if ("pauseWhenHidden" in options) {
			this.pauseWhenHidden = !!options.pauseWhenHidden;
		}

		this.renderer = renderer;
		AppRenderer.shared = this.renderer;

		this.stage = new Container();

		SceneManager.instance.onActiveSceneChanged.subscribe((scene) => {
			this.activeScene = scene;
			this.stage.removeChildren();
			if (scene) {
				this.stage.addChild(scene.stage);
			}
		});

		document.addEventListener("visibilitychange", () => {
			if (this.pauseWhenHidden) {
				Time.paused = document.hidden;
				if (!document.hidden) {
					// reset time
					this.lastFrame = 0;
				}
			}
		});

		if (import.meta.env.MODE === "development") {
			this._stats = new Stats();
			this._stats.showPanel(1);
			document.body.appendChild(this._stats.dom);
		}

		if (options.initialScene) {
			SceneManager.instance.push(options.initialScene);
		}

		requestAnimationFrame(this.tick.bind(this));
		this.frame.appendChild(this.renderer.canvas);
	}

	static async create(options: GameOptions): Promise<Game> {
		const { renderOptions = DEFAULT_RENDER_OPTIONS } = options;

		const renderer = await autoDetectRenderer(renderOptions);
		return new Game(options, renderer);
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
				// flush input
				InputManager.instance.flush();
			}
		}

		this.renderer.render({
			clear: true,
			container: this.stage,
		});

		if (this._stats) {
			this._stats.end();
		}

		// queue next frame
		requestAnimationFrame(this.tick.bind(this));
	}
}
