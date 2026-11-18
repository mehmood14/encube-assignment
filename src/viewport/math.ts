import type { ScreenPoint, Viewport, WorldPoint } from "../shared/types";
export const clampScale = (scale: number) => Math.min(2, Math.max(0.25, scale));
export const localPoint = (
  p: ScreenPoint,
  rect: { left: number; top: number },
): ScreenPoint => ({ x: p.x - rect.left, y: p.y - rect.top });
export const worldToScreen = (p: WorldPoint, v: Viewport): ScreenPoint => ({
  x: p.x * v.scale + v.translation.x,
  y: p.y * v.scale + v.translation.y,
});
export const screenToWorld = (p: ScreenPoint, v: Viewport): WorldPoint => ({
  x: (p.x - v.translation.x) / v.scale,
  y: (p.y - v.translation.y) / v.scale,
});
// Solve translation from the world point under the cursor after clamping scale.
export function zoomAt(
  v: Viewport,
  cursor: ScreenPoint,
  factor: number,
): Viewport {
  const anchor = screenToWorld(cursor, v),
    scale = clampScale(v.scale * factor);
  return {
    scale,
    translation: {
      x: cursor.x - anchor.x * scale,
      y: cursor.y - anchor.y * scale,
    },
  };
}
export function fitBoard(width: number, height: number): Viewport {
  const scale = clampScale(Math.min((width - 48) / 992, (height - 48) / 672));
  return {
    scale,
    translation: {
      x: (width - 992 * scale) / 2,
      y: (height - 672 * scale) / 2,
    },
  };
}
export function pinchViewport(
  v: Viewport,
  start: ScreenPoint,
  current: ScreenPoint,
  distance: number,
  nextDistance: number,
): Viewport {
  const zoomed = zoomAt(v, start, nextDistance / Math.max(1, distance));
  return {
    ...zoomed,
    translation: {
      x: zoomed.translation.x + current.x - start.x,
      y: zoomed.translation.y + current.y - start.y,
    },
  };
}
