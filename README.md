# Mini 3 propeller-guard concept

A local review board for a proposed DJI Mini 3 propeller guard. This concept is not verified: fit, dimensions, clearance, materials, and attachment need real-world checks.

**Live demo:** [encube-assignment.vercel.app](https://encube-assignment.vercel.app/)

**Project demo video:** [Watch the Loom walkthrough](https://www.loom.com/share/c8de3f0c355d47d2b7a479400f6e0b94)

## Development approach

I first used Codex Plan Mode to understand the requirements, define a scope that fit the four-hour time limit, and make key trade-offs and design decisions before implementation. I then used AI-assisted development to build the project within that scope.

## Run locally

Requires Node 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173.

## Features

- Review a 3D guard concept, clearance study, material options, and checklist.
- Pan, zoom, and fit the board; add comment threads and replies.
- Comments save in browser storage. There is no sign-in or live collaboration.
- Rotate the 3D preview when Rotate 3D is enabled.

## Controls

- Pan: drag in Hand mode; use the wheel or trackpad to scroll.
- Zoom: pinch, Ctrl/Cmd+wheel, or the +/- buttons.
- Fit: show the whole board.
- Comment: choose Comment or press `C`, then click the board. Press Enter to place a pin by keyboard.
- Hand: press `H`. Escape cancels or exits rotation.
- Rotate: enable Rotate 3D, then drag the preview or use the arrow keys. Choosing Comment exits rotation.

## Code map

- `src/board/`: board cards and clearance study.
- `src/comments/`: comment threads and browser storage.
- `src/preview/`: 3D model, preview, framing, and rotation.
- `src/viewport/`: board gestures and coordinate transforms.

## Checks

```sh
npm test
npm run typecheck
npm run format:check
npm run build
```

`npm run build` creates the static site in `dist/`.

See [DECISIONS.md](DECISIONS.md) for design choices.
