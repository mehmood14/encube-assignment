interface Point3 {
  x: number;
  y: number;
  z: number;
}
export const PREVIEW_CAMERA: [number, number, number] = [6, 4.5, 8];
// These scene-space bounds cover the guard rails, supports, and proposed clip.
export const previewOutline: Point3[] = Array.from({ length: 64 }, (_, i) => {
  const angle = (i * Math.PI) / 32;
  return [-0.3, 0.3].map((y) => ({
    x: 2.08 * Math.cos(angle),
    y,
    z: 2.08 * Math.sin(angle),
  }));
})
  .flat()
  .concat(
    [-0.35, 0.35].flatMap((x) => [-0.2, 0.2].map((y) => ({ x, y, z: 2.6 }))),
  );
export function projectPreviewPoint(p: Point3, yaw: number, pitch: number) {
  // Three's XYZ Euler order: yaw first, then pitch. Project onto the fixed camera's right/up axes.
  const x = Math.cos(yaw) * p.x + Math.sin(yaw) * p.z;
  const z0 = -Math.sin(yaw) * p.x + Math.cos(yaw) * p.z;
  const y = Math.cos(pitch) * p.y - Math.sin(pitch) * z0;
  const z = Math.sin(pitch) * p.y + Math.cos(pitch) * z0;
  const length = Math.hypot(...PREVIEW_CAMERA);
  return { x: 0.8 * x - 0.6 * z, y: (-2.7 * x + 10 * y - 3.6 * z) / length };
}
export function previewZoom(yaw: number, pitch: number) {
  const points = previewOutline.map((p) => projectPreviewPoint(p, yaw, pitch));
  return Math.min(
    65,
    216 / Math.max(...points.map((p) => Math.abs(p.x))),
    111 / Math.max(...points.map((p) => Math.abs(p.y))),
  );
}
