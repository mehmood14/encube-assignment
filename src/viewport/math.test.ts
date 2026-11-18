import { describe, it, expect } from "vitest";
import {
  worldToScreen,
  screenToWorld,
  zoomAt,
  fitBoard,
  localPoint,
  pinchViewport,
} from "./math";
describe("viewport coordinates", () => {
  it("subtracts container offsets", () =>
    expect(localPoint({ x: 180, y: 140 }, { left: 80, top: 40 })).toEqual({
      x: 100,
      y: 100,
    }));
  it.each([0.25, 0.7, 1, 2])("round trips at %s", (scale) => {
    const v = { scale, translation: { x: -150, y: 83 } };
    const p = { x: 322, y: -84 };
    const result = screenToWorld(worldToScreen(p, v), v);
    expect(result.x).toBeCloseTo(p.x);
    expect(result.y).toBeCloseTo(p.y);
  });
  it.each([0.001, 0.5, 1.5, 20])("anchors actual clamped zoom %s", (factor) => {
    const v = { scale: 1, translation: { x: 42, y: -30 } };
    const p = { x: 180, y: 120 };
    const next = zoomAt(v, p, factor);
    expect(next.scale).toBeGreaterThanOrEqual(0.25);
    expect(next.scale).toBeLessThanOrEqual(2);
    expect(screenToWorld(p, next)).toEqual(screenToWorld(p, v));
  });
  it("fits at 320px with padding", () => {
    const v = fitBoard(320, 400);
    const a = worldToScreen({ x: 0, y: 0 }, v),
      b = worldToScreen({ x: 992, y: 672 }, v);
    expect(v.scale).toBeGreaterThanOrEqual(0.25);
    expect(a.x).toBeGreaterThanOrEqual(24);
    expect(a.y).toBeGreaterThanOrEqual(24);
    expect(b.x).toBeLessThanOrEqual(296);
    expect(b.y).toBeLessThanOrEqual(376);
  });
  it("pinches around a moving centroid", () => {
    const v = { scale: 1, translation: { x: 10, y: 20 } };
    const next = pinchViewport(
      v,
      { x: 100, y: 100 },
      { x: 120, y: 140 },
      100,
      200,
    );
    expect(worldToScreen(screenToWorld({ x: 100, y: 100 }, v), next)).toEqual({
      x: 120,
      y: 140,
    });
  });
});
it("keeps the viewport unchanged when zooming beyond an existing limit", () => {
  for (const scale of [0.25, 2]) {
    const v = { scale, translation: { x: 78, y: 32 } };
    expect(zoomAt(v, { x: 123, y: 456 }, scale === 2 ? 2 : 0.5)).toEqual(v);
  }
});
