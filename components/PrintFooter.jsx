"use client";

import { useEffect, useState } from "react";

// The line printed under the admit card, enrollment card and result: the page address on the left, the print
// date and page number on the right ("https://www.gsos-ac.in/admit-card   19/11/26, 3:36 AM   Page 1 of 1").
// It is part of the card itself, so it always prints (the browser's own header/footer cannot be relied on and is
// switched off by the card's page margin). Hidden on screen.
function stamp() {
  return new Date()
    .toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "numeric", minute: "2-digit", hour12: true })
    .toUpperCase();
}

export default function PrintFooter() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const update = () => setInfo({ url: window.location.origin + window.location.pathname, when: stamp() });
    update();
    window.addEventListener("beforeprint", update); // the time of printing, not of opening the page
    return () => window.removeEventListener("beforeprint", update);
  }, []);

  if (!info) return null;
  return (
    <div className="mt-[2mm] hidden items-start justify-between gap-4 px-1 text-[9px] leading-tight text-[#727272] print:flex">
      <span className="break-all">{info.url}</span>
      <span className="shrink-0 text-right">
        {info.when}
        <br />
        Page 1 of 1
      </span>
    </div>
  );
}
