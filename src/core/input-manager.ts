import { AppRenderer } from './renderer';

export enum KeyboardEventType {
  KEY_DOWN = 'KEY_DOWN',
  KEY_UP = 'KEY_UP',
}

export enum MouseEventType {
  MOUSE_MOVE = 'MOUSE_MOVE',
  MOUSE_DOWN = 'MOUSE_DOWN',
  MOUSE_UP = 'MOUSE_UP',
}

export enum MouseButtons {
  Left,
}

export enum CommonKeys {
  ArrowLeft = 'arrowleft',
  ArrowRight = 'arrowRight',
  ArrowUp = 'arrowup',
  ArrowDown = 'arrowdown',
  Enter = 'Enter',
  Space = ' ',
}

export const AlphaNumericCharacters: Readonly<string[]> =
  'abcdefghijklmnopqrstuvwxyz1234567890'.split('');

const MOVEMENT_KEYS = {
  left: [CommonKeys.ArrowLeft, 'A'],
  right: [CommonKeys.ArrowRight, 'D'],
  up: [CommonKeys.ArrowUp, 'W'],
  down: [CommonKeys.ArrowDown, 'S'],
};

export class InputManager {
  private static _instance: InputManager;
  private pressedKeys = new Map<string, boolean>();
  private newPressedKeys: string[] = [];
  private newReleasedKeys: string[] = [];
  private _mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private pressedMouseButtons = new Map<number, boolean>();
  private newPressedMouseButtons: number[] = [];
  private newReleasedMouseButtons: number[] = [];

  constructor(bindElement: HTMLElement | Window = window) {
    // Set up input bindings
    bindElement.addEventListener('keydown', (event: Event) => {
      this._handleKeyboardEvent(
        event as KeyboardEvent,
        KeyboardEventType.KEY_DOWN,
      );
    });

    bindElement.addEventListener('keyup', (event: Event) => {
      this._handleKeyboardEvent(
        event as KeyboardEvent,
        KeyboardEventType.KEY_UP,
      );
    });

    bindElement.addEventListener('mousemove', (event: Event) => {
      if ((event.target as HTMLElement).nodeName !== 'CANVAS') {
        return;
      }
      this._handleMouseEvent(event as MouseEvent, MouseEventType.MOUSE_MOVE);
    });

    bindElement.addEventListener('mousedown', (event: Event) => {
      if ((event.target as HTMLElement).nodeName !== 'CANVAS') {
        return;
      }
      this._handleMouseEvent(event as MouseEvent, MouseEventType.MOUSE_DOWN);
    });

    bindElement.addEventListener('mouseup', (event: Event) => {
      this._handleMouseEvent(event as MouseEvent, MouseEventType.MOUSE_UP);
    });
  }

  static get instance(): InputManager {
    if (!InputManager._instance) {
      InputManager._instance = new InputManager();
    }
    return InputManager._instance;
  }

  flush(): void {
    this.newPressedKeys = [];
    this.newReleasedKeys = [];
    this.newPressedMouseButtons = [];
    this.newReleasedMouseButtons = [];
  }

  private _handleKeyboardEvent(
    event: KeyboardEvent,
    kind: KeyboardEventType,
  ): void {
    if (kind === KeyboardEventType.KEY_DOWN) {
      // If key is newly pressed...
      if (
        this.keyUp(event.key.toUpperCase()) &&
        this.newPressedKeys.indexOf(event.key.toUpperCase()) < 0
      ) {
        this.newPressedKeys.push(event.key.toUpperCase());
      }
      this.pressedKeys.set(event.key.toUpperCase(), true);
    } else {
      if (
        this.keyDown(event.key.toUpperCase()) &&
        this.newReleasedKeys.indexOf(event.key.toUpperCase()) < 0
      ) {
        this.newReleasedKeys.push(event.key.toUpperCase());
      }
      this.pressedKeys.set(event.key.toUpperCase(), false);
    }
  }

  private _handleMouseEvent(event: MouseEvent, kind: MouseEventType): void {
    if (kind === MouseEventType.MOUSE_MOVE) {
      const canvas = event.target as HTMLCanvasElement;
      const rect = getObjectFitSize(
        true,
        canvas.scrollWidth,
        canvas.scrollHeight,
        AppRenderer.shared.width,
        AppRenderer.shared.height,
      );
      this._mousePosition = {
        x: Math.round((event.clientX - rect.left) / rect.ratio),
        y: Math.round((event.clientY - rect.top) / rect.ratio),
      };
    } else if (kind === MouseEventType.MOUSE_DOWN) {
      // If button is newly pressed...
      if (
        this.mouseUp(event.button) &&
        this.newPressedMouseButtons.indexOf(event.button) < 0
      ) {
        this.newPressedMouseButtons.push(event.button);
      }
      this.pressedMouseButtons.set(event.button, true);
    } else if (kind === MouseEventType.MOUSE_UP) {
      if (
        this.mouseDown(event.button) &&
        this.newReleasedMouseButtons.indexOf(event.button) < 0
      ) {
        this.newReleasedMouseButtons.push(event.button);
      }
      this.pressedMouseButtons.set(event.button, false);
    }
  }

  /*
   * Returns true if the given key was newly pressed (since the last frame)
   */
  keyPressed(key: string): boolean {
    return this.newPressedKeys.indexOf(key.toUpperCase()) >= 0;
  }

  /*
   * Returns true if the given key was newly released (since the last frame)
   */
  keyReleased(key: string): boolean {
    return this.newReleasedKeys.indexOf(key.toUpperCase()) >= 0;
  }

  /*
   * Is the given key currently down (pressed)
   */
  keyDown(key: string): boolean {
    return (
      this.pressedKeys.has(key.toUpperCase()) &&
      this.pressedKeys.get(key.toUpperCase()) === true
    );
  }

  /*
   * Is the given key currently up (not pressed)
   */
  keyUp(key: string): boolean {
    return !this.keyDown(key.toUpperCase());
  }

  getNewKeys(): string[] {
    return this.newPressedKeys;
  }

  /**
   * Is the mouse button currently down (pressed)
   * @param button
   */
  mouseDown(button: number): boolean {
    return (
      this.pressedMouseButtons.has(button) &&
      this.pressedMouseButtons.get(button) === true
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
    return this.newPressedMouseButtons.includes(button);
  }

  /**
   * Returns true of the mouse button was newly released
   * @param button
   */
  mouseReleased(button: number): boolean {
    return this.newReleasedMouseButtons.includes(button);
  }

  get mousePosition(): Readonly<{ x: number; y: number }> {
    return this._mousePosition;
  }

  get movement(): Readonly<{ x: number; y: number }> {
    let x = 0;
    let y = 0;
    if (MOVEMENT_KEYS.left.filter((key) => this.keyDown(key)).length) {
      x = -1;
    } else if (MOVEMENT_KEYS.right.filter((key) => this.keyDown(key)).length) {
      x = 1;
    }
    if (MOVEMENT_KEYS.up.filter((key) => this.keyDown(key)).length) {
      y = -1;
    } else if (MOVEMENT_KEYS.down.filter((key) => this.keyDown(key)).length) {
      y = 1;
    }

    return {
      x,
      y,
    };
  }
}

//
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
  var doRatio = width / height;
  var cRatio = containerWidth / containerHeight;
  var targetWidth = 0;
  var targetHeight = 0;
  var test = contains ? doRatio > cRatio : doRatio < cRatio;

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
