import { memo } from "react";
import { PreviewErrorBoundary, PreviewFallback } from "./PreviewErrorBoundary";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { PREVIEW_CAMERA, previewZoom } from "./framing";
import { PropellerGuardModel } from "./PropellerGuardModel";
export const PropellerGuardPreview = memo(function PropellerGuardPreview({
  yaw,
  pitch,
  rotationEnabled,
}: {
  yaw: number;
  pitch: number;
  rotationEnabled: boolean;
}) {
  return (
    <div
      className="preview"
      data-preview
      data-rotate-preview
      role="group"
      tabIndex={rotationEnabled ? 0 : undefined}
      aria-label={
        rotationEnabled
          ? "Conceptual single-rotor guard preview; drag or use arrow keys to rotate"
          : "Static conceptual single-rotor guard preview; enable Rotate 3D to inspect"
      }
    >
      <PreviewErrorBoundary>
        <Canvas
          aria-hidden="true"
          frameloop="demand"
          dpr={Math.min(window.devicePixelRatio || 1, 2)}
          resize={{ offsetSize: true, scroll: false }}
          fallback={<PreviewFallback />}
          style={{ pointerEvents: "none" }}
        >
          <OrthographicCamera
            makeDefault
            position={PREVIEW_CAMERA}
            onUpdate={(camera) => camera.lookAt(0, 0, 0)}
            zoom={previewZoom(yaw, pitch)}
            near={0.1}
            far={100}
          />
          <hemisphereLight args={["#fafbf7", "#61745c", 1.1]} />
          <directionalLight position={[4, 7, 5]} intensity={2.6} />
          <directionalLight position={[-5, 2, -3]} intensity={0.8} />
          <PropellerGuardModel yaw={yaw} pitch={pitch} />
        </Canvas>
      </PreviewErrorBoundary>
      <span className="preview-tag">
        FIT AND DIMENSIONS UNVERIFIED
      </span>
    </div>
  );
});
