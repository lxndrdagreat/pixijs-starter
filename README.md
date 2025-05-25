# Pixi.js Starter

_Because I kept doing this over and over._

## Features

- WebGL/WebGPU via [Pixi.js](https://pixijs.com/)
- Game structure
  - Delta time handling with a fixed tick rate
  - [Input management](src/core/inputManager.ts)
  - [Scene management](./src/core/scene.ts)
  - [Example scene](./src/scenes/example.scene.ts) showing how to write scenes, handling update tick, input, etc.
- [Subscription system](./src/core/subscribable.ts)
- [PseudoRandom class](src/core/pseudoRandom.ts)
  - Seedable random number generator
  - Random range values (integers and floats)
  - Random choice from an Array
  - Random weighted choice from an Array
- [Math helpers](./src/core/math.ts) including:
  - point-in-rectangle check
  - Conversion between Array index and 2D coordinates
- Solid dev environment
  - [Vite](https://vitejs.dev/) dev environment
  - [Biome.js](https://biomejs.dev/) style formatting
  - TypeScript
  - [Stats.js](https://mrdoob.github.io/stats.js/) when running in dev mode
  - Simple, sane defaults for project structure

## Get Started

- Clone/fork/download the code into a new project/repo/folder
- Update project info
  - [`package.json`](./package.json) name/description/version fields
  - [`index.html`](./index.html) details
- Install dependencies via `npm`, `pnpm`, `yarn`, etc.
- Run the Vite dev server via the `run` script

## Game Options

When initializing the game, some options can be supplied. Check the [GameOptions](./src/core/game.ts) `interface` for
the complete list, but the required option is the `HTMLElement` _frame_ that will house the Pixi.js Canvas.

## Working within the game loop

The game loop is handled by the [Game](./src/core/game.ts) class,
utilizing [window.requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).
The game loop is a fixed tick rate (set via [Time.frameRate](./src/core/time.ts)), meaning that the game will run at a
fixed number of ticks per second.

Every frame, the game will do the following:

- Update the global [delta time](./src/core/time.ts), which can be used to calculate time-based values.
- Call the `update()` function for the active [Scene](./src/core/scene.ts).
- Render.
- Flush the [InputManager](src/core/inputManager.ts) (clearing the input state for the next frame).

## Scenes

All scenes should
[implement](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html#interfaces)
the [Scene](./src/core/scene.ts) `interface`. This ensures that the scene has the required functions and properties to
be used by the game. See the [example scene](./src/scenes/example.scene.ts) for a basic example of how to write a scene.

### Stage

Scenes should have a `stage` property, which is
a [Pixi.js Container](https://pixijs.download/dev/docs/PIXI.Container.html). This is the root container for the scene
and is rendered in the game loop.

### Loading

```
// load assets and set up the scene
async load(): Promise<void> { ... }
```

Putting all loading of resources in the `load()` function ensures that the game will not start until the scene is
ready.

### Update

The `update()` function is where your per-frame logic should go. This is called every frame, after the global delta time
is set. Use the global [Time.deltaTime](./src/core/time.ts) to calculate time-based values.
