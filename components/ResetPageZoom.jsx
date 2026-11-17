"use client";

import { useEffect } from "react";

// The public site's text-size control (A- / A / A+) zooms the whole page and keeps that zoom when you
// move to another page without a full reload. Dashboards are laid out for 100%, so they reset it.
export default function ResetPageZoom() {
  useEffect(() => {
    try {
      document.documentElement.style.zoom = "";
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
