"use client";

import { useCallback, useRef, useState } from "react";

/** Pointer drag-to-dismiss for mobile bottom sheets. Desktop is a no-op. */
export function useSheetDrag(onClose: () => void, desktopMinWidth = 640) {
  const dragY = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const resetDrag = useCallback(() => {
    dragY.current = 0;
    setOffsetY(0);
    setIsDragging(false);
    dragging.current = false;
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (window.matchMedia(`(min-width: ${desktopMinWidth}px)`).matches) return;
    dragging.current = true;
    setIsDragging(true);
    startY.current = event.clientY;
    dragY.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!dragging.current) return;
    const delta = Math.max(0, event.clientY - startY.current);
    dragY.current = delta;
    setOffsetY(delta);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    if (dragY.current > 110) {
      resetDrag();
      onClose();
      return;
    }
    setOffsetY(0);
  }

  const sheetStyle =
    offsetY > 0
      ? {
          transform: `translateY(${offsetY}px)`,
          transition: isDragging ? "none" : undefined,
        }
      : undefined;

  return {
    offsetY,
    isDragging,
    sheetStyle,
    resetDrag,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
