import type { Renderer } from "pixi.js";
import { gcd } from "@/core/math";

let shared: Renderer;

export default {
	/**
	 * Gets the shared app renderer for the application.
	 *
	 * @example
	 * import AppRenderer from "@/core/appRenderer";
	 *
	 * // ...snip...
	 *
	 * const {width, height} = AppRenderer.shared;
	 */
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

/**
 * Defines common aspect ratio resolutions.
 */
export const ASPECT_RATIO_RESOLUTIONS = {
	ASPECT_4_3: {
		r640x480: { width: 640, height: 480 },
		r800x600: { width: 800, height: 600 },
		r960x720: { width: 960, height: 720 },
		r1024x768: { width: 1024, height: 768 },
	},
	ASPECT_5_3: {
		r400x240: { width: 400, height: 240 },
		r800x480: { width: 800, height: 480 },
		r1280x768: { width: 1280, height: 768 },
	},
	ASPECT_16_9: {
		r640x360: { width: 640, height: 360 },
		r1280x720: { width: 1280, height: 720 },
		r1536x864: { width: 1536, height: 864 },
		r1600x900: { width: 1600, height: 900 },
		r1920x1080: { width: 1920, height: 1080 },
		r2048x1152: { width: 2048, height: 1152 },
		r2560x1440: { width: 2560, height: 1440 },
		r3840x2160: { width: 3840, height: 2160 },
	},
	ASPECT_16_10: {
		r1280x800: { width: 1280, height: 800 },
		r1440x900: { width: 1440, height: 900 },
		r1680x1050: { width: 1680, height: 1050 },
		r1920x1200: { width: 1920, height: 1200 },
		r2560x1600: { width: 2560, height: 1600 },
	},
};

/**
 * Returns the aspect ratio (as a string) for the given width and height.
 */
export function toAspectRatio(width: number, height: number): string {
	const divisor = gcd(width, height);
	return `${width / divisor}:${height / divisor}`;
}

/**
 * Returns whether the given width and height have a 4:3 aspect ratio
 */
export const aspectRatioIs4to3 = (width: number, height: number): boolean =>
	toAspectRatio(width, height) === "4:3";

/**
 * Returns whether the given width and height have a 5:3 aspect ratio
 */
export const aspectRatioIs5to3 = (width: number, height: number): boolean =>
	toAspectRatio(width, height) === "5:3";

/**
 * Returns whether the given width and height have a 16:9 aspect ratio
 */
export const aspectRatioIs16to9 = (width: number, height: number): boolean =>
	toAspectRatio(width, height) === "16:9";

/**
 * Returns whether the given width and height have a 16:10 aspect ratio
 */
export const aspectRatioIs16to10 = (width: number, height: number): boolean =>
	toAspectRatio(width, height) === "16:10";
