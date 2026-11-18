import type { ScreenPoint } from "../shared/types";
export interface Gesture {
  start: ScreenPoint;
  everDragged: boolean;
  cancelled: boolean;
  eligible: boolean;
}
export const startGesture = (
  start: ScreenPoint,
  eligible: boolean,
): Gesture => ({ start, eligible, everDragged: false, cancelled: false });
// This latch intentionally survives a pointer returning to its starting point.
export const moveGesture = (g: Gesture, p: ScreenPoint): Gesture => ({
  ...g,
  everDragged:
    g.everDragged || Math.hypot(p.x - g.start.x, p.y - g.start.y) >= 5,
});
export const cancelGesture = (g: Gesture): Gesture => ({
  ...g,
  cancelled: true,
});
export const canPlace = (g: Gesture) =>
  g.eligible && !g.everDragged && !g.cancelled;
