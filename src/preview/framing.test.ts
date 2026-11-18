import { expect, it } from "vitest";
import { previewZoom, previewOutline, projectPreviewPoint } from "./framing";
it("frames the default single-rotor guard without clipping its clip", () => {
  const zoom = previewZoom(-0.25, 0);
  expect(zoom).toBeGreaterThan(58);
  for (const point of previewOutline) {
    const p = projectPreviewPoint(point, -0.25, 0);
    expect(Math.abs(p.x) * zoom).toBeLessThanOrEqual(216);
    expect(Math.abs(p.y) * zoom).toBeLessThanOrEqual(111);
  }
});
it("keeps the guard framed across yaw and permitted pitch", () => {
  for (const pitch of [-Math.PI / 3, 0, Math.PI / 3])
    for (let yaw = 0; yaw < Math.PI * 2; yaw += Math.PI / 8) {
      const zoom = previewZoom(yaw, pitch);
      for (const point of previewOutline) {
        const p = projectPreviewPoint(point, yaw, pitch);
        expect(Math.abs(p.x) * zoom).toBeLessThanOrEqual(216.001);
        expect(Math.abs(p.y) * zoom).toBeLessThanOrEqual(111.001);
      }
    }
});
