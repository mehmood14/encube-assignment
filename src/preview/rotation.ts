interface Orientation {
  yaw: number;
  pitch: number;
}

export const initialOrientation: Orientation = { yaw: -0.25, pitch: 0 };

export function rotateModel(
  orientation: Orientation,
  dx: number,
  dy: number,
): Orientation {
  return {
    yaw: orientation.yaw + dx * 0.01,
    pitch: Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 3, orientation.pitch + dy * 0.01),
    ),
  };
}
