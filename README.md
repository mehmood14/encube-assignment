# Mini 3 / Propeller guard

A local concept-review board for a proposed DJI Mini 3 propeller guard. Four fixed artifacts show a procedural single-rotor guard, an annotated clearance study, four exploratory material/process candidates, and a lightweight pre-print checklist. The concept is not verified: **fit, dimensions, clearance, material suitability, and attachment are unverified / TBD.**

## Run locally

Use Node 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. No environment variables, backend, accounts or external assets are required.

```sh
npm test              # pure math, gestures, reducer, storage and rotation tests
npm run typecheck     # strict TypeScript check
npm run format:check  # source/config formatting
npm run build         # TypeScript check + production build
npm run preview       # serve dist at http://127.0.0.1:4173
```

## Code map

- `src/board/Board.tsx`: the four board artifacts and screen-space pins.
- `src/board/ClearanceStudy.tsx`: the guard-aligned conceptual top view and reference-clearance callouts.
- `src/viewport/math.ts` and `useBoardInput.ts`: coordinate conversion, zoom, capture and gesture ownership.
- `src/comments/threads.ts` and `persistence.ts`: typed reducer, seed data and versioned storage.
- `src/preview/PropellerGuardModel.tsx`: shared procedural guard geometry.
- `src/preview/PropellerGuardPreview.tsx` and `rotation.ts`: inline, demand-rendered guard preview and bounded drag rotation.
- `src/preview/PreviewErrorBoundary.tsx`: shared WebGL failure handling.

## Controls

| Action                  | Control                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Explore                 | Hand is the default; drag or middle-drag                                                                                           |
| Pan                     | Wheel / two-finger trackpad scroll                                                                                                 |
| Zoom                    | Pinch or Ctrl/Cmd + wheel; − / + buttons; 25–200%                                                                                  |
| Fit four studies        | Fit board; 24px padding, including 320px-wide portrait screens                                                                     |
| Add a thread            | Choose Comment or press C, then click anywhere on board content                                                                    |
| Keyboard placement      | Focus the board and press Enter in Comment mode                                                                                    |
| Move an unsubmitted pin | Click another board position, preserving text; use Move pin to leave the mobile drawer                                             |
| Cancel / close          | Explicit Cancel/Close controls or Escape outside editable fields                                                                   |
| Change tool             | H = Hand, C = Comment                                                                                                              |
| Rotate the guard        | Toggle Rotate 3D in the concept card, then drag the preview or focus it and use arrow keys; toggle it off to resume board dragging |
| Read a thread           | Click its pin or its list entry; list selection eases to its location without changing zoom                                        |
| Resolve / reopen        | Thread panel; selection stays visible until closed even if excluded by the current filter                                          |

C/H and normal Escape handling ignore editable fields, composition, held-key repeats and modified combinations. While Rotate 3D is active, Escape exits rotation even when an editor is focused, leaving the editor open. Selecting Comment also exits rotation. Wheel, trackpad scroll and pinch continue to navigate the board while rotation is enabled. The Letter shortcuts checkbox disables C/H. In a textarea, use the explicit cancellation button to discard editing.

## Comments and persistence

New messages are authored by **Mehmood**. Seeded reviewers simulate collaboration; there is no authentication or live collaboration. Only Mehmood's root messages and replies have Edit controls. Replies form a single chronological level under each root.

Threads save to the versioned `mini3-review.threads` localStorage entry. Viewport, draft, selection and tools reset on refresh. A narrow migration refreshes untouched prior seed prompts and adds the checklist prompt while retaining customized messages, replies and user-created threads. Invalid/unsupported storage opens the seed review in memory without overwriting the unreadable value; blocked writes retain current session data and announce the failure. To reset the review, remove this key in browser developer tools and refresh.

## Verification

Automated checks:

- `npm test`: 26 tests passed across six files.
- `npm run typecheck`: strict TypeScript check.
- `npm run format:check`: Prettier check.
- `npm run build`: TypeScript check and production build.

Browser checks confirmed that preview dragging rotates only when Rotate 3D is enabled, while wheel scrolling still moves the board. Escape and Comment exit rotation. Pan, zoom, Fit, comment creation, thread replies, resolve/reopen and persistence were also exercised.

There is no ESLint configuration or lint script. Safari-specific gestures and physical-device touch have not been verified. The Vite build reports a large 3D preview chunk (about 902 kB minified).

See [DECISIONS.md](DECISIONS.md) for design choices.

## Deploy and submit

Git setup, commits and publishing are left to the author as requested. This is a standard Vite static application:

1. Publish this directory to your GitHub repository, including `package-lock.json`.
2. Import that repository into Vercel. Framework: Vite; build command: `npm run build`; output: `dist`.
3. Smoke-test the live deployment, especially storage, Fit, model rotation and a new comment.
4. Deploy to the planned URL below, smoke-test it, then record the walkthrough.

| Artifact          | Status                                         |
| ----------------- | ---------------------------------------------- |
| GitHub repository | Author to publish                              |
| Live demo         | Planned: https://encube-assignment.vercel.app/ |
| Narrated video    | Author to record/upload                        |

The Three.js preview is loaded as a separate chunk so the commenting shell can load independently. The inline preview is the only WebGL canvas; R3F demand rendering updates the model when rotation changes and rests while idle. Vite reports its large 3D bundle size, an expected trade-off for the requested stack.
