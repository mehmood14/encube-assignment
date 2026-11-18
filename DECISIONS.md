# Design decisions

## What the board is for

This board reviews a personal DJI Mini 3 propeller-guard concept. It does not show a verified DJI product or prove that the guard is safe.

The board has four fixed cards:

1. A 3D guard concept.
2. A drawing for clearance and attachment questions.
3. Four possible material and printing options.
4. A short review checklist.

The guard and drawing use simple shapes to show the same proposed design. Measurements, fit, materials, attachment, and safety still need real-world checks.

## Moving around the board

The board uses world coordinates for cards and comments, and screen coordinates for display. One shared transform moves and zooms the cards. Comment pins use the same transform, so they stay anchored to their locations and remain easy to click.

Hand mode is the default. Drag to move the board; use the wheel to scroll and pinch or Ctrl/Command-scroll to zoom. Fit shows all four cards when space allows. Comment mode lets reviewers add a note anywhere on the board.

The Rotate 3D button changes what a drag on the model does. When it is on, dragging the model rotates it; other board gestures still navigate the board. Comment or Escape turns rotation off. Comments stay attached to the board, not the rotating model.

## The 3D preview

The guard is built from simple Three.js shapes; there are no external model files. The board uses one WebGL preview, which only redraws when needed. Its pixel density is capped to reduce graphics work. If WebGL fails, the rest of the board and comments remain available.

## Notes and saved work

Comments are saved in the browser, not sent to a server. They support replies, editing your own messages, resolving threads, and filtering. The local reviewer name is an example, not secure sign-in or live collaboration.

If browser storage is unavailable, the app explains that changes only last for the current session. It also keeps existing customized comments when updating older starter comments.

## Scope limits

This is a concept review, not CAD software or a flight-safety check. It has no sign-in, shared live editing, model uploads, 3D comments, or verified measurements. Extra tools such as undo, a mini-map, and bulk actions were left out to keep the focus on board navigation and review comments.

## What I cut and why

- Sign-in and live collaboration: the assignment only needs a local demo.
- Model uploads and movable cards: fixed examples keep the review simple.
- Replies to replies: one reply level is easier to follow.
- Undo, a mini-map, and bulk actions: they are not needed for the main review tasks.
- Constant animation and extra 3D detail: they add work without helping reviewers discuss the concept.

Test commands and known limits are in [README.md](./README.md). Publishing, deployment, and recording the walkthrough have not been completed.
