import type { Renderer } from "pixi.js";

let shared: Renderer;

export default {
	get shared(): Renderer {
		if (!shared) {
			throw new Error("Renderer is not initialized.");
		}
		return shared;
	},

	set shared(value: Renderer) {
		shared = value;
	},
};
