let deltaTime = 0;
let paused = false;
const frameRate: number = 1.0 / 144;

export default {
	get deltaTime(): number {
		return deltaTime;
	},

	set deltaTime(value: number) {
		deltaTime = value;
	},

	get paused(): boolean {
		return paused;
	},

	set paused(value: boolean) {
		paused = value;
	},

	get frameRate(): number {
		return frameRate;
	},
};
