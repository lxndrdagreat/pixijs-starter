import AppRenderer from "@/core/appRenderer";

export enum KeyboardEventType {
	KEY_DOWN = "KEY_DOWN",
	KEY_UP = "KEY_UP",
}

export enum MouseEventType {
	MOUSE_MOVE = "MOUSE_MOVE",
	MOUSE_DOWN = "MOUSE_DOWN",
	MOUSE_UP = "MOUSE_UP",
}

export enum MouseButtons {
	Left = 0,
}

/**
 * Common keys used by games
 */
export enum CommonKeys {
	ArrowLeft = "arrowleft",
	ArrowRight = "arrowright",
	ArrowUp = "arrowup",
	ArrowDown = "arrowdown",
	Enter = "Enter",
	Space = " ",
	Escape = "Escape",
	Tab = "Tab",
}

export const AlphaNumericCharacters: Readonly<string[]> =
	"abcdefghijklmnopqrstuvwxyz1234567890".split("");

interface MappedInputs {
	movement: {
		left: string[];
		right: string[];
		up: string[];
		down: string[];
	};
}

export interface InputManagerConfiguration {
	bindElement?: HTMLElement | Window;
	mappedInputs?: MappedInputs;
}

export class InputManager {
	private static _instance: InputManager;
	#pressedKeys = new Map<string, boolean>();
	#pressedKeysThisFrame: string[] = [];
	#releasedKeysThisFrame: string[] = [];
	#mousePosition: { x: number; y: number } = { x: 0, y: 0 };
	#pressedMouseButtons = new Map<number, boolean>();
	#pressedMouseButtonsThisFrame: number[] = [];
	#releasedMouseButtonsThisFrame: number[] = [];
	#mappedInputs: MappedInputs;

	constructor(config?: InputManagerConfiguration) {
		const {
			bindElement = window,
			mappedInputs = {
				movement: {
					left: [CommonKeys.ArrowLeft, "A"],
					right: [CommonKeys.ArrowRight, "D"],
					up: [CommonKeys.ArrowUp, "W"],
					down: [CommonKeys.ArrowDown, "S"],
				},
			},
		} = config || {};

		this.#mappedInputs = mappedInputs;

		// Set up input bindings
		bindElement.addEventListener("keydown", (event: Event) => {
			this.#handleKeyboardEvent(
				event as KeyboardEvent,
				KeyboardEventType.KEY_DOWN,
			);
		});

		bindElement.addEventListener("keyup", (event: Event) => {
			this.#handleKeyboardEvent(
				event as KeyboardEvent,
				KeyboardEventType.KEY_UP,
			);
		});

		bindElement.addEventListener("mousemove", (event: Event) => {
			if ((event.target as HTMLElement).nodeName !== "CANVAS") {
				return;
			}
			this.#handleMouseEvent(event as MouseEvent, MouseEventType.MOUSE_MOVE);
		});

		bindElement.addEventListener("mousedown", (event: Event) => {
			if ((event.target as HTMLElement).nodeName !== "CANVAS") {
				return;
			}
			this.#handleMouseEvent(event as MouseEvent, MouseEventType.MOUSE_DOWN);
		});

		bindElement.addEventListener("mouseup", (event: Event) => {
			this.#handleMouseEvent(event as MouseEvent, MouseEventType.MOUSE_UP);
		});
	}

	static get instance(): InputManager {
		if (!InputManager._instance) {
			InputManager._instance = new InputManager();
		}
		return InputManager._instance;
	}

	flush(): void {
		this.#pressedKeysThisFrame = [];
		this.#releasedKeysThisFrame = [];
		this.#pressedMouseButtonsThisFrame = [];
		this.#releasedMouseButtonsThisFrame = [];
	}

	#handleKeyboardEvent(event: KeyboardEvent, kind: KeyboardEventType): void {
		if (kind === KeyboardEventType.KEY_DOWN) {
			// If key is newly pressed...
			if (
				this.keyUp(event.key.toUpperCase()) &&
				this.#pressedKeysThisFrame.indexOf(event.key.toUpperCase()) < 0
			) {
				this.#pressedKeysThisFrame.push(event.key.toUpperCase());
			}
			this.#pressedKeys.set(event.key.toUpperCase(), true);
		} else {
			if (
				this.keyDown(event.key.toUpperCase()) &&
				this.#releasedKeysThisFrame.indexOf(event.key.toUpperCase()) < 0
			) {
				this.#releasedKeysThisFrame.push(event.key.toUpperCase());
			}
			this.#pressedKeys.set(event.key.toUpperCase(), false);
		}
	}

	#handleMouseEvent(event: MouseEvent, kind: MouseEventType): void {
		if (kind === MouseEventType.MOUSE_MOVE) {
			const canvas = event.target as HTMLCanvasElement;
			const rect = getObjectFitSize(
				true,
				canvas.scrollWidth,
				canvas.scrollHeight,
				AppRenderer.shared.width,
				AppRenderer.shared.height,
			);
			this.#mousePosition = {
				x: Math.round((event.clientX - rect.left) / rect.ratio),
				y: Math.round((event.clientY - rect.top) / rect.ratio),
			};
		} else if (kind === MouseEventType.MOUSE_DOWN) {
			// If button is newly pressed...
			if (
				this.mouseUp(event.button) &&
				this.#pressedMouseButtonsThisFrame.indexOf(event.button) < 0
			) {
				this.#pressedMouseButtonsThisFrame.push(event.button);
			}
			this.#pressedMouseButtons.set(event.button, true);
		} else if (kind === MouseEventType.MOUSE_UP) {
			if (
				this.mouseDown(event.button) &&
				this.#releasedMouseButtonsThisFrame.indexOf(event.button) < 0
			) {
				this.#releasedMouseButtonsThisFrame.push(event.button);
			}
			this.#pressedMouseButtons.set(event.button, false);
		}
	}

	/**
	 * Returns true if the given key was newly pressed (since the last frame)
	 */
	keyPressed(key: string): boolean {
		return this.#pressedKeysThisFrame.indexOf(key.toUpperCase()) >= 0;
	}

	/**
	 * Returns true if the given key was newly released (since the last frame)
	 */
	keyReleased(key: string): boolean {
		return this.#releasedKeysThisFrame.indexOf(key.toUpperCase()) >= 0;
	}

	/**
	 * Is the given key currently down (pressed)
	 */
	keyDown(key: string): boolean {
		return (
			this.#pressedKeys.has(key.toUpperCase()) &&
			this.#pressedKeys.get(key.toUpperCase()) === true
		);
	}

	/**
	 * Is the given key currently up (not pressed)
	 */
	keyUp(key: string): boolean {
		return !this.keyDown(key.toUpperCase());
	}

	getNewKeys(): string[] {
		return this.#pressedKeysThisFrame;
	}

	/**
	 * Is the mouse button currently down (pressed)
	 * @param button
	 */
	mouseDown(button: number): boolean {
		return (
			this.#pressedMouseButtons.has(button) &&
			this.#pressedMouseButtons.get(button) === true
		);
	}

	/**
	 * Is the given button currently up (not pressed)
	 * @param button
	 */
	mouseUp(button: number): boolean {
		return !this.mouseDown(button);
	}

	/**
	 * Returns true of the mouse button was newly pressed
	 * @param button
	 */
	mousePressed(button: number): boolean {
		return this.#pressedMouseButtonsThisFrame.includes(button);
	}

	/**
	 * Returns true of the mouse button was newly released
	 * @param button The index of the Mouse Button to check
	 */
	mouseReleased(button: number): boolean {
		return this.#releasedMouseButtonsThisFrame.includes(button);
	}

	/**
	 * Returns the position of the mouse cursor
	 */
	get mousePosition(): Readonly<{ x: number; y: number }> {
		return this.#mousePosition;
	}

	get movement(): Readonly<{ x: number; y: number }> {
		let x = 0;
		let y = 0;
		if (
			this.#mappedInputs.movement.left.filter((key) => this.keyDown(key)).length
		) {
			x = -1;
		} else if (
			this.#mappedInputs.movement.right.filter((key) => this.keyDown(key))
				.length
		) {
			x = 1;
		}
		if (
			this.#mappedInputs.movement.up.filter((key) => this.keyDown(key)).length
		) {
			y = -1;
		} else if (
			this.#mappedInputs.movement.down.filter((key) => this.keyDown(key)).length
		) {
			y = 1;
		}

		return {
			x,
			y,
		};
	}
}

/* true = contain, false = cover */
/**
 * Used to determine the size of the canvas, due to how object-fit CSS property
 * makes width/height inaccurate
 * @see https://www.npmjs.com/package/intrinsic-scale
 * @param contains
 * @param containerWidth
 * @param containerHeight
 * @param width
 * @param height
 */
function getObjectFitSize(
	contains: boolean,
	containerWidth: number,
	containerHeight: number,
	width: number,
	height: number,
): {
	width: number;
	height: number;
	x: number;
	y: number;
	left: number;
	top: number;
	ratio: number;
} {
	const doRatio = width / height;
	const cRatio = containerWidth / containerHeight;
	let targetWidth: number;
	let targetHeight: number;
	const test = contains ? doRatio > cRatio : doRatio < cRatio;

	if (test) {
		targetWidth = containerWidth;
		targetHeight = targetWidth / doRatio;
	} else {
		targetHeight = containerHeight;
		targetWidth = targetHeight * doRatio;
	}

	const left = (containerWidth - targetWidth) / 2;
	const top = (containerHeight - targetHeight) / 2;

	return {
		width: targetWidth,
		height: targetHeight,
		x: left,
		y: top,
		left,
		top,
		ratio: targetWidth / width,
	};
}
