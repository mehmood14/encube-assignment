import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ScreenPoint, Tool, Viewport, WorldPoint } from "../shared/types";
import { canPlace, moveGesture, startGesture } from "./gesture";
import type { Gesture } from "./gesture";
import {
  fitBoard,
  localPoint,
  pinchViewport,
  screenToWorld,
  zoomAt,
} from "./math";
interface Options {
  tool: Tool;
  onPlace: (p: WorldPoint) => void;
  rotationEnabled: boolean;
  onRotate: (dx: number, dy: number) => void;
}
interface Drag {
  id: number;
  gesture: Gesture;
  viewport: Viewport;
  mode: "navigate" | "rotate";
  last: ScreenPoint;
}
interface Pinch {
  viewport: Viewport;
  center: ScreenPoint;
  distance: number;
}
export function useBoardInput(options: Options) {
  const surface = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({
    scale: 1,
    translation: { x: 0, y: 0 },
  });
  const current = useRef(viewport),
    latest = useRef(options);
  latest.current = options;
  const drag = useRef<Drag | null>(null),
    pinch = useRef<Pinch | null>(null);
  const points = useRef(new Map<number, ScreenPoint>());
  const frame = useRef(0),
    animation = useRef(0);
  // Keep math current immediately; board and pins publish the same snapshot per frame.
  const publish = useCallback((v: Viewport) => {
    current.current = v;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setViewport(current.current));
  }, []);
  const cancel = useCallback(() => {
    const active = points.current;
    const hadActive = active.size > 0;
    points.current = new Map();
    drag.current = null;
    pinch.current = null;
    for (const id of active.keys())
      if (surface.current?.hasPointerCapture(id))
        surface.current.releasePointerCapture(id);
    return hadActive;
  }, []);
  const stopAnimation = () => cancelAnimationFrame(animation.current);
  const animateTo = useCallback(
    (to: Viewport) => {
      cancelAnimationFrame(animation.current);
      cancel();
      const from = current.current;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        publish(to);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 280),
          k = 1 - (1 - t) ** 3;
        publish({
          scale: from.scale + (to.scale - from.scale) * k,
          translation: {
            x: from.translation.x + (to.translation.x - from.translation.x) * k,
            y: from.translation.y + (to.translation.y - from.translation.y) * k,
          },
        });
        if (t < 1) animation.current = requestAnimationFrame(tick);
      };
      animation.current = requestAnimationFrame(tick);
    },
    [cancel, publish],
  );
  const local = (x: number, y: number) =>
    localPoint({ x, y }, surface.current!.getBoundingClientRect());
  const fit = useCallback(() => {
    cancelAnimationFrame(animation.current);
    cancel();
    if (surface.current)
      publish(
        fitBoard(surface.current.clientWidth, surface.current.clientHeight),
      );
  }, [publish, cancel]);
  const fitSmooth = useCallback(() => {
    if (surface.current)
      animateTo(
        fitBoard(surface.current.clientWidth, surface.current.clientHeight),
      );
  }, [animateTo]);
  useEffect(() => {
    fit();
    const blur = () => {
      cancel();
      cancelAnimationFrame(animation.current);
    };
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("blur", blur);
      cancelAnimationFrame(frame.current);
      cancelAnimationFrame(animation.current);
    };
  }, [fit, cancel]);
  useEffect(() => {
    const el = surface.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      cancel();
      stopAnimation();
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      const dx = e.deltaX * unit,
        dy = e.deltaY * unit,
        v = current.current;
      publish(
        e.ctrlKey || e.metaKey
          ? zoomAt(v, local(e.clientX, e.clientY), Math.exp(-dy * 0.002))
          : {
              ...v,
              translation: { x: v.translation.x - dx, y: v.translation.y - dy },
            },
      );
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [cancel, publish]);
  const pair = () => {
    const [a, b] = [...points.current.values()];
    return {
      center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      distance: Math.hypot(b.x - a.x, b.y - a.y),
    };
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (
      target.closest(
        'button,input,textarea,select,a,[contenteditable="true"],[data-board-controls]',
      )
    )
      return;
    e.preventDefault();
    stopAnimation();
    const p = local(e.clientX, e.clientY);
    points.current.set(e.pointerId, p);
    e.currentTarget.setPointerCapture(e.pointerId);
    // Pinch owns all participating contacts until every contact has ended.
    if (points.current.size === 2) {
      pinch.current = { ...pair(), viewport: current.current };
      drag.current = null;
      return;
    }
    if (points.current.size > 1) return;
    drag.current = {
      id: e.pointerId,
      viewport: current.current,
      gesture: startGesture(
        p,
        e.button === 0 && latest.current.tool === "comment",
      ),
      mode:
        e.button === 0 &&
        latest.current.rotationEnabled &&
        target.closest("[data-rotate-preview]")
          ? "rotate"
          : "navigate",
      last: p,
    };
  };
  const update = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!points.current.has(e.pointerId)) return;
    const p = local(e.clientX, e.clientY);
    points.current.set(e.pointerId, p);
    if (pinch.current) {
      if (points.current.size >= 2) {
        const now = pair(),
          start = pinch.current;
        publish(
          pinchViewport(
            start.viewport,
            start.center,
            now.center,
            start.distance,
            now.distance,
          ),
        );
      }
      return;
    }
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const wasDragged = d.gesture.everDragged;
    d.gesture = moveGesture(d.gesture, p);
    if (d.mode === "rotate") {
      if (d.gesture.everDragged) {
        const from = wasDragged ? d.last : d.gesture.start;
        latest.current.onRotate(p.x - from.x, p.y - from.y);
      }
      d.last = p;
      return;
    }
    if (d.gesture.everDragged) {
      publish({
        ...d.viewport,
        translation: {
          x: d.viewport.translation.x + p.x - d.gesture.start.x,
          y: d.viewport.translation.y + p.y - d.gesture.start.y,
        },
      });
    }
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!points.current.has(e.pointerId)) return;
    update(e);
    const d = drag.current;
    if (d?.id === e.pointerId && canPlace(d.gesture))
      latest.current.onPlace(
        screenToWorld(local(e.clientX, e.clientY), current.current),
      );
    points.current.delete(e.pointerId);
    drag.current = null;
    if (points.current.size === 0) pinch.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const center = () => ({
    x: (surface.current?.clientWidth ?? 0) / 2,
    y: (surface.current?.clientHeight ?? 0) / 2,
  });
  const zoom = (factor: number) => {
    stopAnimation();
    cancel();
    publish(zoomAt(current.current, center(), factor));
  };
  const navigate = (p: WorldPoint, bottomInset = 0) => {
    const c = center();
    c.y = Math.max(24, c.y - bottomInset / 2);
    const from = current.current,
      to = {
        ...from,
        translation: { x: c.x - p.x * from.scale, y: c.y - p.y * from.scale },
      };
    animateTo(to);
  };
  return {
    surface,
    viewport,
    fit,
    fitSmooth,
    zoom,
    navigate,
    cancel,
    placeAtCenter: () =>
      latest.current.onPlace(screenToWorld(center(), current.current)),
    handlers: {
      onPointerDown,
      onPointerMove: update,
      onPointerUp,
      onPointerCancel: cancel,
      onLostPointerCapture: (e: ReactPointerEvent<HTMLDivElement>) => {
        if (points.current.has(e.pointerId)) cancel();
      },
    },
  };
}
