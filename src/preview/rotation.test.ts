import { expect, it } from "vitest";
import { initialOrientation, rotateModel } from "./rotation";

it("maps preview drag to yaw and pitch", () => {
  const next = rotateModel(initialOrientation, 20, -10);
  expect(next.yaw).toBeCloseTo(-0.05);
  expect(next.pitch).toBeCloseTo(-0.1);
});

it("bounds pitch while preserving unrestricted yaw", () => {
  expect(rotateModel({ yaw: 2, pitch: Math.PI / 3 - 0.01 }, 100, 10)).toEqual({
    yaw: 3,
    pitch: Math.PI / 3,
  });
  expect(rotateModel({ yaw: 0, pitch: 0 }, 0, -1000).pitch).toBe(-Math.PI / 3);
});
