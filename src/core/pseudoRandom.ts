export interface WeightedItem<T> {
	item: T;
	weight: number;
}

// https://stackoverflow.com/a/47593316/2065517
function _cyrb128(str: string): [number, number, number, number] {
	let h1 = 1779033703;
	let h2 = 3144134277;
	let h3 = 1013904242;
	let h4 = 2773480762;
	for (let i = 0, k: number; i < str.length; i++) {
		k = str.charCodeAt(i);
		h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
		h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
		h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
		h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
	}
	h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
	h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
	h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
	h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
	return [
		(h1 ^ h2 ^ h3 ^ h4) >>> 0,
		(h2 ^ h1) >>> 0,
		(h3 ^ h1) >>> 0,
		(h4 ^ h1) >>> 0,
	];
}

// https://stackoverflow.com/a/47593316/2065517
function _sfc32(
	one: number,
	two: number,
	three: number,
	four: number,
): () => number {
	let a = one;
	let b = two;
	let c = three;
	let d = four;
	return (): number => {
		a >>>= 0;
		b >>>= 0;
		c >>>= 0;
		d >>>= 0;
		let t = (a + b) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		d = (d + 1) | 0;
		t = (t + d) | 0;
		c = (c + t) | 0;
		return (t >>> 0) / 4294967296;
	};
}

function generateRandomString(): string {
	return Array.from(
		{ length: 8 },
		() => Math.floor(Math.random() * 33) + 89,
	).join("");
}

/**
 * Class-based, seedable random number generator.
 */
export class PseudoRandom {
	public static shared: PseudoRandom = new PseudoRandom();
	#rand: () => number;
	#steps = 0;
	#seed: string = generateRandomString();

	constructor(seed?: string, preheat?: number) {
		this.#rand = () => 0;
		this.reSeed(seed);
		if (preheat) {
			this.preheat(preheat);
		}
	}

	get steps(): number {
		return this.#steps;
	}

	get seed(): string {
		return this.#seed;
	}

	preheat(times: number): void {
		for (let i = 0; i < times; ++i) {
			this.intRange(0, 2);
		}
	}

	reSeed(s?: string): void {
		this.#seed = s ?? generateRandomString();
		const [a, b, c, d] = _cyrb128(this.#seed);
		this.#rand = _sfc32(a, b, c, d);
	}

	intRange(min: number, max: number): number {
		this.#steps++;
		const minimum = Math.ceil(min);
		const maximum = Math.floor(max);
		return Math.floor(this.#rand() * (maximum - minimum) + minimum);
	}

	num(min: number, max: number): number {
		this.#steps++;
		return this.#rand() * (max - min) + min;
	}

	choice<T = unknown>(items: T[]): T {
		if (!items.length) {
			throw new Error("Cannot choose from empty array.");
		}
		return items[this.intRange(0, items.length)];
	}

	weightedChoice<T>(weightedItems: WeightedItem<T>[]): T {
		const total = weightedItems.reduce(
			(previousValue: number, currentValue: WeightedItem<T>) => {
				return previousValue + currentValue.weight;
			},
			0,
		);
		const value = this.num(0, total);
		let upto = 0;
		for (const weightedItem of weightedItems) {
			if (upto + weightedItem.weight >= value) {
				return weightedItem.item;
			}
			upto += weightedItem.weight;
		}
		throw new Error(
			"weightedChoice did not find a result. This should not happen.",
		);
	}
}
