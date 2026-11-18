"use client";

import { useEffect, useRef, useState } from "react";

// The cards (admit card, enrollment card, result marksheet) are designed for A4. On a narrow screen they are shown
// exactly as they will print, scaled down to the width of the screen. Printing is not affected (see globals.css).
export default function FitCard({ children, width = 860 }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [innerH, setInnerH] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      setScale(Math.min(1, outer.clientWidth / width));
      setInnerH(inner.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [width]);

  const scaled = scale < 1;
  return (
    <div ref={outerRef} className="fit-card w-full" style={scaled ? { height: innerH * scale } : undefined}>
      <div ref={innerRef} className="fit-card-inner" style={scaled ? { width, transform: `scale(${scale})`, transformOrigin: "top left" } : undefined}>
        {children}
      </div>
    </div>
  );
}
