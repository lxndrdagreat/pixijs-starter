export interface PointLike {
	x: number;
	y: number;
}

export type PointTuple = [x: number, y: number];

export function distance(
	{ x, y }: PointLike,
	{ x: x2, y: y2 }: PointLike,
): number {
	return Math.sqrt((x2 - x) ** 2 + (y2 - y) ** 2);
}

export function indexToCoord(index: number, width: number): PointTuple {
	const x = Math.floor(index % width);
	const y = Math.floor(index / width);
	return [x, y];
}

export function coordToIndex(
	coord: PointLike | PointTuple,
	width: number,
): number {
	if (Array.isArray(coord)) {
		const [x, y] = coord;
		return y * width + x;
	}
	const { x, y } = coord;
	return y * width + x;
}

export function pointInRect(
	point: PointLike | PointTuple,
	[left, top, right, bottom]: [
		left: number,
		top: number,
		right: number,
		bottom: number,
	],
): boolean {
	const [x, y] = Array.isArray(point) ? point : [point.x, point.y];
	return x >= left && x <= right && y >= top && y <= bottom;
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

export function coordinateKey(coord: PointLike | PointTuple): number {
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
