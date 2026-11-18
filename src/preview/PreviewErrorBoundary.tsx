import { Component } from "react";
import type { ReactNode } from "react";
export function PreviewFallback() {
  return (
    <div className="webgl-fallback">
      3D view unavailable.
      <br />
      Review the clearance study instead.
    </div>
  );
}
export class PreviewErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("3D preview failed to render.", error);
  }
  render() {
    return this.state.failed ? <PreviewFallback /> : this.props.children;
  }
}
