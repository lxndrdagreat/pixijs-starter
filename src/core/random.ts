/**
 * Return a random number between 0 (inclusive) and 1 (exclusive)
 */
export function getRandom(): number {
  return Math.random();
}

export function getRandomArbitrary(min: number, max: number): number {
  return getRandom() * (max - min) + min;
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function rollDie(sides: number, quantity: number = 1): number {
  return Array.from({ length: quantity }, () =>
    getRandomInt(1, sides + 1)
  ).reduce((sum, value) => sum + value);
}

export function choice<T = any>(items: T[]): T {
  if (!items.length) {
    throw new Error('Cannot choose from empty array.');
  }
  return items[getRandomInt(0, items.length)];
}
