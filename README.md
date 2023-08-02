# Pixi.js Starter

_Because I kept doing this over and over._

## Features

- WebGL via [Pixi.js](https://pixijs.com/)
- [Vite](https://vitejs.dev/) dev environment
- [Prettier](https://prettier.io/) style formatting
- Game structure
    - Delta time handling with fixed tick rate
    - [Input management](./src/core/input-manager.ts)
    - [Scene management](./src/core/scene.ts)
    - [Example scene](./src/scenes/example.scene.ts) showing how to write scenes, handling update tick, input, etc.
- [Subscription system](./src/core/subscribable.ts)
- [Random utils](./src/core/random.ts)
    - Seedable random number generator
    - Random range values (integers and floats)
    - Random choice from an Array
- [Math helpers](./src/core/math.ts) including:
  - point-in-rectangle check
  - Conversion between Array index and 2D coordinates

## Get Started

- Clone/fork/download the code into a new project/repo/folder
- Update project info
    - [`package.json`](./package.json) name/description/version fields
    - [`index.html`](./index.html) details
- _Optional:_ use [Volta](https://volta.sh/) to ensure you're using the pinned versions of Node/yarn
- Install dependencies: `yarn`
- Run `yarn dev` to start the Vite dev server

## Game Options

When initializing the game, some options can be supplied. Check the [GameOptions](./src/core/game.ts) `interface` for
the complete list, but the required option is the `HTMLElement` _frame_ that will house the Pixi.js Canvas.
