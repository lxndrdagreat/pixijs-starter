import AppRenderer from "@/core/appRenderer";
import { CommonKeys, InputManager } from "@/core/inputManager";
import { PseudoRandom } from "@/core/pseudoRandom";
import { Scene } from "@/core/scene";
import Time from "@/core/time";
import { Assets, Graphics, Point, Sprite } from "pixi.js";

const SQUARE_COLORS = [
	0xffff00, 0xff0000, 0x00ff00, 0x0000ff, 0x00ffff, 0xff00ff,
];

export class ExampleScene extends Scene {
	#square: Graphics;
	#squareColorIndex = 0;
	#logo: Sprite;
	#speed = 256;
	#velocity: Point = new Point(0, 0);

	constructor() {
		super();
		this.#square = new Graphics();

		this.#squareColorIndex = PseudoRandom.shared.intRange(
			0,
			SQUARE_COLORS.length,
		);
		this.#buildSquare();

		this.#square.position.set(
			PseudoRandom.shared.intRange(0, AppRenderer.shared.width - 64),
			PseudoRandom.shared.intRange(0, AppRenderer.shared.height - 64),
		);

		// random diagonal
		this.#velocity.set(
			...PseudoRandom.shared.choice([
				[1, 1],
				[1, -1],
				[-1, 1],
				[-1, -1],
			]),
		);

		this.stage.addChild(this.#square);

		const texture = Assets.get("logo");
		this.#logo = new Sprite(texture);
		this.#logo.anchor.set(0.5, 0.5);
		this.stage.addChild(this.#logo);
	}

	static override async load(): Promise<ExampleScene> {
		// Load the logo as a texture so we can use it in a sprite
		Assets.add({
			alias: "logo",
			src: "/vite.svg",
		});
		await Assets.load("logo");
		return new ExampleScene();
	}

	#buildSquare(): void {
		++this.#squareColorIndex;
		this.#square.rect(0, 0, 64, 64);
		this.#square.fill(
			SQUARE_COLORS[this.#squareColorIndex % SQUARE_COLORS.length],
		);
	}

	override update(): void {
		const { width, height } = AppRenderer.shared;

		// center the logo
		this.#logo.position.set(width / 2, height / 2);
		// rotate the logo
		this.#logo.rotation += Math.PI * Time.deltaTime;

		if (InputManager.instance.keyPressed(CommonKeys.Space)) {
			this.#buildSquare();
		}

		this.#square.position.set(
			this.#square.position.x + this.#velocity.x * this.#speed * Time.deltaTime,
			this.#square.position.y + this.#velocity.y * this.#speed * Time.deltaTime,
		);

		let bounced = false;
		if (this.#square.position.x + this.#square.width >= width) {
			this.#velocity.set(-this.#velocity.x, this.#velocity.y);
			bounced = true;
		} else if (this.#square.position.x <= 0) {
			this.#velocity.set(-this.#velocity.x, this.#velocity.y);
			bounced = true;
		}
		if (this.#square.position.y + this.#square.height >= height) {
			this.#velocity.set(this.#velocity.x, -this.#velocity.y);
			bounced = true;
		} else if (this.#square.position.y <= 0) {
			this.#velocity.set(this.#velocity.x, -this.#velocity.y);
			bounced = true;
		}

		if (bounced) {
			this.#buildSquare();
		}
	}
}
