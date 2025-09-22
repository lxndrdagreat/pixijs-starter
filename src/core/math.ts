import type { PointData } from "pixi.js";

export interface RectangleLike {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type CardinalDelta = [-1, 0] | [1, 0] | [0, -1] | [0, 1];

export const CARDINAL_DELTAS: Record<string, CardinalDelta> = {
	N: [0, -1],
	S: [0, 1],
	E: [1, 0],
	W: [-1, 0],
} as const;

export function distance(
	{ x, y }: PointData,
	{ x: x2, y: y2 }: PointData,
): number {
	return Math.sqrt((x2 - x) ** 2 + (y2 - y) ** 2);
}

export function manhattanDistance(
	{ x, y }: PointData,
	{ x: x2, y: y2 }: PointData,
): number {
	return Math.abs(x2 - x) + Math.abs(y2 - y);
}

export function indexToCoord(index: number, width: number): PointData {
	const x = Math.floor(index % width);
	const y = Math.floor(index / width);
	return { x, y };
}

export function coordToIndex(coord: PointData, width: number): number {
	if (Array.isArray(coord)) {
		const [x, y] = coord;
		return y * width + x;
	}
	const { x, y } = coord;
	return y * width + x;
}

export function pointInBounds(
	point: PointData,
	left: number,
	top: number,
	right: number,
	bottom: number,
): boolean {
	const [x, y] = Array.isArray(point) ? point : [point.x, point.y];
	return x >= left && x <= right && y >= top && y <= bottom;
}

export function pointInRect(point: PointData, rect: RectangleLike): boolean {
	return pointInBounds(
		point,
		rect.x,
		rect.y,
		rect.x + rect.width,
		rect.y + rect.height,
	);
}

export function rectIntersectsRect(
	rect1: RectangleLike,
	rect2: RectangleLike,
): boolean {
	return (
		rect1.x < rect2.x + rect2.width &&
		rect1.x + rect1.width > rect2.x &&
		rect1.y < rect2.y + rect2.height &&
		rect1.y + rect1.height > rect2.y
	);
}

/**
 * Converts degrees to radians
 */
export function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 */
export function toDegrees(radians: number): number {
	return radians * (180 / Math.PI);
}

function _szudzikPair(x: number, y: number): number {
	return x >= y ? x * x + x + y : y * y + x;
}

function _szudzikPairSignedB(x: number, y: number): number {
	const a = x >= 0.0 ? 2.0 * x : -2.0 * x - 1.0;
	const b = y >= 0.0 ? 2.0 * y : -2.0 * y - 1.0;
	const c = _szudzikPair(a, b) * 0.5;

	if ((a >= 0.0 && b < 0.0) || (a < 0.0 && b >= 0.0)) {
		return -c - 1;
	}

	return c;
}

export function coordinateKey(coord: PointData): number {
	if (Array.isArray(coord)) {
		return _szudzikPairSignedB(coord[0], coord[1]);
	}
	return _szudzikPairSignedB(coord.x, coord.y);
}

/**
 * Finds greatest common divisor, non-recursively
 * https://stackoverflow.com/questions/17445231/js-how-to-find-the-greatest-common-divisor
 * @param a {number}
 * @param b {number}
 * @returns {number}
 */
export function gcd(a: number, b: number): number {
	let aa = a;
	let bb = b;
	while (b) {
		[aa, bb] = [bb, aa % bb];
	}
	return aa;
}
