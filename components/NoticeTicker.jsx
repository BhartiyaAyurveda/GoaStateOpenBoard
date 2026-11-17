"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, CalendarDays, ExternalLink } from "lucide-react";

function NoticeRow({ text, date, isNew, href }) {
  return (
    <li className="border-b border-dashed border-[#9db7e0] hover:bg-[#f2f7fe]">
      <a href={href || "/notices"} {...(/^https:\/\//.test(href || "") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex min-h-[84px] items-center gap-3 px-4 py-3 text-ink hover:text-brand">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-navy">
          <FileText size={22} strokeWidth={1.6} />
        </span>
        <span className="flex-1">
          <span className="block text-[14.5px] font-semibold leading-snug">{text}</span>
          <span className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-[#5b6b8c]">
            <CalendarDays size={12} strokeWidth={2} /> {date}
          </span>
        </span>
        {isNew && (
          <span className="animate-blink rounded-sm bg-[#e0242b] px-2 py-[3px] text-[11px] font-extrabold leading-none tracking-wider text-white shadow-sm">
            NEW
          </span>
        )}
        <ExternalLink size={15} strokeWidth={1.8} className="shrink-0 text-navy" />
      </a>
    </li>
  );
}

const RESUME_AFTER_MS = 2500; // auto-scroll restarts this long after the last manual scroll

/**
 * Vertical notice board. It scrolls by itself (the list is rendered twice and wraps
 * seamlessly) but it is a real scroll container, so visitors can also scroll it with
 * the mouse wheel, touch, scrollbar or keyboard. Auto-scroll pauses while the pointer
 * is over it, while it has keyboard focus, and for a moment after any manual scroll.
 */
export default function NoticeTicker({ notices }) {
  const boxRef = useRef(null);
  const listRef = useRef(null);
  const [loop, setLoop] = useState(true); // false when every notice already fits
  const secondsPerPass = Math.max(notices.length * 5, 20);

  // short lists don't need to loop (or be repeated)
  useEffect(() => {
    const measure = () => {
      const box = boxRef.current;
      const list = listRef.current;
      if (box && list) setLoop(list.offsetHeight > box.clientHeight + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [notices]);

  useEffect(() => {
    if (!loop) return;
    const box = boxRef.current;
    const list = listRef.current;
    if (!box || !list) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const st = { pos: box.scrollTop, last: box.scrollTop, hover: false, focus: false, touch: false, idleAt: 0, t: 0, raf: 0 };
    const now = () => performance.now();

    const tick = (t) => {
      const dt = st.t ? Math.min(t - st.t, 64) : 0;
      st.t = t;
      const h = list.offsetHeight;
      const running = !reduce.matches && !st.hover && !st.focus && !st.touch && now() - st.idleAt > RESUME_AFTER_MS;
      if (running && h > 0) {
        st.pos += (h / secondsPerPass) * (dt / 1000);
        if (st.pos >= h) st.pos -= h; // identical second copy: jump back unnoticed
        box.scrollTop = st.pos;
        st.last = box.scrollTop;
      }
      st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);

    // a scroll we didn't cause = the visitor scrolled manually
    const onScroll = () => {
      if (Math.abs(box.scrollTop - st.last) > 2) {
        st.pos = box.scrollTop;
        st.last = box.scrollTop;
        st.idleAt = now();
      }
    };
    const onEnter = (e) => { if (e.pointerType === "mouse") st.hover = true; };
    const onLeave = (e) => { if (e.pointerType === "mouse") { st.hover = false; st.idleAt = now(); } };
    const onFocusIn = () => { st.focus = true; };
    const onFocusOut = () => { st.focus = false; st.idleAt = now(); };
    const onTouchStart = () => { st.touch = true; };
    const onTouchEnd = () => { st.touch = false; st.idleAt = now(); };
    const onWheel = () => { st.idleAt = now(); };

    box.addEventListener("scroll", onScroll, { passive: true });
    box.addEventListener("pointerenter", onEnter);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("focusin", onFocusIn);
    box.addEventListener("focusout", onFocusOut);
    box.addEventListener("touchstart", onTouchStart, { passive: true });
    box.addEventListener("touchend", onTouchEnd, { passive: true });
    box.addEventListener("touchcancel", onTouchEnd, { passive: true });
    box.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      cancelAnimationFrame(st.raf);
      box.removeEventListener("scroll", onScroll);
      box.removeEventListener("pointerenter", onEnter);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("focusin", onFocusIn);
      box.removeEventListener("focusout", onFocusOut);
      box.removeEventListener("touchstart", onTouchStart);
      box.removeEventListener("touchend", onTouchEnd);
      box.removeEventListener("touchcancel", onTouchEnd);
      box.removeEventListener("wheel", onWheel);
    };
  }, [loop, secondsPerPass]);

  return (
    <div className="notice-ticker relative min-h-[380px] flex-1">
      <div ref={boxRef} tabIndex={0} role="region" aria-label="Latest notices"
        className="notice-ticker-scroll absolute inset-0 overflow-y-auto overscroll-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1b57d8]/40">
        <ul ref={listRef}>
          {notices.map((n, i) => (
            <NoticeRow key={`${i}-${n.text}`} {...n} />
          ))}
        </ul>
        {loop && (
          <ul aria-hidden="true" inert>
            {notices.map((n, i) => (
              <NoticeRow key={`dup-${i}-${n.text}`} {...n} />
            ))}
          </ul>
        )}
      </div>
      {/* soft fade at the top and bottom edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
