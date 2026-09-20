export type PanzoomOptions = {
  minScale?: number;
  maxScale?: number;
  startScale?: number;
  onChange?: (state: { x: number; y: number; scale: number }) => void;
};

export type PanzoomInstance = {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomWithWheel: (event: WheelEvent) => void;
  reset: () => void;
  destroy: () => void;
  getScale: () => number;
  wasDragged: () => boolean;
};

/**
 * A small, dependency-free Panzoom-compatible controller bundled with the Site.
 * It keeps the Skill Tree functional without a CDN and supports mouse, touch,
 * wheel zooming, and two-finger pinch gestures.
 */
export default function Panzoom(element: HTMLElement, options: PanzoomOptions = {}): PanzoomInstance {
  const viewport = element.parentElement;
  if (!viewport) throw new Error("Panzoom requires a viewport parent.");

  const minScale = options.minScale ?? .5;
  const maxScale = options.maxScale ?? 2;
  let scale = Math.min(maxScale, Math.max(minScale, options.startScale ?? 1));
  let x = 0;
  let y = 0;
  let dragged = false;
  const pointers = new Map<number, { x: number; y: number }>();
  let gesture = { x: 0, y: 0, scale, pointerX: 0, pointerY: 0, distance: 1, midpointX: 0, midpointY: 0 };

  const clamp = (value: number) => Math.min(maxScale, Math.max(minScale, value));
  const apply = () => {
    element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
    options.onChange?.({ x, y, scale });
  };
  const begin = () => {
    const points = [...pointers.values()];
    if (points.length === 1) {
      gesture = { ...gesture, x, y, scale, pointerX: points[0].x, pointerY: points[0].y };
    } else if (points.length >= 2) {
      const [first, second] = points;
      gesture = {
        ...gesture,
        x, y, scale,
        distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
        midpointX: (first.x + second.x) / 2,
        midpointY: (first.y + second.y) / 2,
      };
    }
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragged = false;
    viewport.classList.add("dragging");
    begin();
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.values()];
    if (points.length === 1) {
      const dx = points[0].x - gesture.pointerX;
      const dy = points[0].y - gesture.pointerY;
      if (Math.abs(dx) + Math.abs(dy) > 4) dragged = true;
      x = gesture.x + dx;
      y = gesture.y + dy;
    } else if (points.length >= 2) {
      const [first, second] = points;
      const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
      const midpointX = (first.x + second.x) / 2;
      const midpointY = (first.y + second.y) / 2;
      dragged = true;
      x = gesture.x + midpointX - gesture.midpointX;
      y = gesture.y + midpointY - gesture.midpointY;
      scale = clamp(gesture.scale * distance / gesture.distance);
    }
    apply();
  };
  const onPointerEnd = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (pointers.size) begin();
    else {
      viewport.classList.remove("dragging");
      window.setTimeout(() => { dragged = false; }, 0);
    }
  };
  const zoomAt = (nextScale: number, clientX?: number, clientY?: number) => {
    const rect = viewport.getBoundingClientRect();
    const anchorX = (clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
    const anchorY = (clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
    const next = clamp(nextScale);
    const ratio = next / scale;
    x = anchorX - (anchorX - x) * ratio;
    y = anchorY - (anchorY - y) * ratio;
    scale = next;
    apply();
  };
  const zoomWithWheel = (event: WheelEvent) => {
    event.preventDefault();
    zoomAt(scale * Math.exp(-event.deltaY * .0015), event.clientX, event.clientY);
  };

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerEnd);
  viewport.addEventListener("pointercancel", onPointerEnd);
  viewport.addEventListener("wheel", zoomWithWheel, { passive: false });
  apply();

  return {
    zoomIn: () => zoomAt(scale * 1.25),
    zoomOut: () => zoomAt(scale * .8),
    zoomWithWheel,
    reset: () => { x = 0; y = 0; scale = 1; apply(); },
    destroy: () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerEnd);
      viewport.removeEventListener("pointercancel", onPointerEnd);
      viewport.removeEventListener("wheel", zoomWithWheel);
    },
    getScale: () => scale,
    wasDragged: () => dragged,
  };
}
