// https://stackoverflow.com/a/47593316/2065517
function _cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
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
function _sfc32(a: number, b: number, c: number, d: number): () => number {
  return function (): number {
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

const DEFAULT_SEED: [number, number, number, number] = [
  0x9e3779b9,
  0x243f6a88,
  0xb7e15162,
  1337 ^ 0xdeadbeef,
];

/**
 * Class-based, seedable random number generator.
 */
export class Random {
  public static shared: Random = new Random();
  private _rand: () => number;

  constructor(seed?: string) {
    this._rand = () => 0;
    this.seed(seed);
  }

  seed(s?: string): void {
    if (!!s) {
      const [a, b, c, d] = _cyrb128(s);
      this._rand = _sfc32(a, b, c, d);
      return;
    }
    this._rand = _sfc32(...DEFAULT_SEED);
  }

  intRange(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(this._rand() * (max - min) + min);
  }

  num(min: number, max: number): number {
    return this._rand() * (max - min) + min;
  }

  coordinateInBounds(
    x: number,
    y: number,
    width: number,
    height: number,
  ): [number, number] {
    return [this.intRange(x, x + width), this.intRange(y, y + height)];
  }

  rollDie(sides: number, quantity: number = 1): number {
    quantity = Math.max(1, quantity);
    return Array.from({ length: quantity }, () =>
      this.intRange(1, sides + 1),
    ).reduce((sum, value) => sum + value);
  }

  choice<T = any>(items: T[]): T {
    if (!items.length) {
      throw new Error('Cannot choose from empty array.');
    }
    return items[this.intRange(0, items.length)];
  }
}
