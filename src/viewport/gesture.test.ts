import { it, expect } from "vitest";
import { startGesture, moveGesture, cancelGesture, canPlace } from "./gesture";
it("latches a drag even after return to origin", () => {
  let g = startGesture({ x: 0, y: 0 }, true);
  g = moveGesture(g, { x: 5, y: 0 });
  g = moveGesture(g, { x: 0, y: 0 });
  expect(canPlace(g)).toBe(false);
});
it("only permits eligible sub-threshold clicks", () => {
  expect(
    canPlace(moveGesture(startGesture({ x: 0, y: 0 }, true), { x: 4, y: 0 })),
  ).toBe(true);
  expect(canPlace(startGesture({ x: 0, y: 0 }, false))).toBe(false);
});
it("cancellation suppresses placement", () =>
  expect(canPlace(cancelGesture(startGesture({ x: 0, y: 0 }, true)))).toBe(
    false,
  ));
it("classifies the release coordinate even with no intermediate move", () =>
  expect(
    canPlace(moveGesture(startGesture({ x: 0, y: 0 }, true), { x: 3, y: 4 })),
  ).toBe(false));
it("cannot revive a cancelled gesture with later movement", () =>
  expect(
    canPlace(
      moveGesture(cancelGesture(startGesture({ x: 0, y: 0 }, true)), {
        x: 1,
        y: 1,
      }),
    ),
  ).toBe(false));
