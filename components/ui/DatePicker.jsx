"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Custom date picker, used instead of the browser's native <input type="date"> popup so it looks the
 * same on every device. Value is an ISO string "YYYY-MM-DD" (or "" when empty), exactly like the native input.
 *
 * - click the month / year in the header to jump straight to another month or year (handy for dates of birth)
 * - keyboard: arrows move by day / week, PageUp / PageDown by month, Home / End by year, Enter selects, Esc closes
 * - the calendar lives in a portal on <body> and is positioned against the viewport, so it is never clipped by a
 *   scrolling card or modal; it opens upwards when there is not enough room below
 *
 * <DatePicker value={v} onChange={(value) => ...} min="1940-01-01" max="2026-11-19" />
 */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const daysIn = (y, m) => new Date(y, m, 0).getDate();
const weekday = (y, m, d) => new Date(y, m - 1, d).getDay();

function parse(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > daysIn(y, mo)) return null;
  return { y, m: mo, d };
}

function todayISO() {
  const t = new Date();
  return toISO(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

function addDays(iso, n) {
  const p = parse(iso);
  const d = new Date(p.y, p.m - 1, p.d + n);
  return toISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function addMonths(iso, n) {
  const p = parse(iso);
  const first = new Date(p.y, p.m - 1 + n, 1);
  const y = first.getFullYear(), m = first.getMonth() + 1;
  return toISO(y, m, Math.min(p.d, daysIn(y, m)));
}

const display = (iso) => {
  const p = parse(iso);
  return p ? `${pad(p.d)}-${pad(p.m)}-${p.y}` : "";
};

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  id,
  ariaLabel,
  placeholder = "DD-MM-YYYY",
  disabled = false,
  invalid = false,
  withIcon = false, // the parent draws a field icon on the left: leave room for it
  variant = "dashboard", // "dashboard" | "form" (registration / admin forms) | "public" (public website forms)
  size = "lg", // dashboard variant only: "md" (40px) | "lg" (44px)
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("days"); // days | months | years
  const [focus, setFocus] = useState(""); // keyboard-focused date (ISO)
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const uid = useId();

  const today = todayISO();
  const minISO = parse(min) ? min : "";
  const maxISO = parse(max) ? max : "";
  const selected = parse(value) ? value : "";
  const inRange = (iso) => (!minISO || iso >= minISO) && (!maxISO || iso <= maxISO);
  const clamp = (iso) => (minISO && iso < minISO ? minISO : maxISO && iso > maxISO ? maxISO : iso);

  const shown = parse(focus || selected || clamp(today)); // the month on display
  const minYear = parse(minISO)?.y ?? new Date().getFullYear() - 100;
  const maxYear = parse(maxISO)?.y ?? new Date().getFullYear() + 30;

  function measure() {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const width = Math.min(320, vw - 16);
    const left = Math.max(8, Math.min(r.left, vw - width - 8));
    const need = 400;
    const below = vh - r.bottom - 12, above = r.top - 12;
    const up = below < need && above > below;
    setPos({ up, left, width, top: r.bottom + 6, bottom: vh - r.top + 6, maxH: Math.max(260, up ? above : below) });
  }

  function openPicker() {
    if (disabled) return;
    setFocus(selected || clamp(today));
    setView("days");
    measure();
    setOpen(true);
  }

  function pick(iso) {
    if (!inRange(iso)) return;
    onChange(iso);
    setOpen(false);
    btnRef.current?.focus();
  }

  // outside click / touch closes (the calendar is in a portal, so check it separately)
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // keep attached to the field while the page / a modal scrolls or the window resizes
  useEffect(() => {
    if (!open) return;
    const onMove = (e) => {
      if (e?.target && popRef.current?.contains(e.target)) return;
      measure();
    };
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  // move DOM focus to the focused day so the keyboard keeps working
  useEffect(() => {
    if (open && view === "days") popRef.current?.querySelector(`[data-iso="${focus}"]`)?.focus({ preventScroll: true });
  }, [open, view, focus]);

  // bring the selected year into view in the year list
  useEffect(() => {
    if (open && view === "years") popRef.current?.querySelector('[data-cur="1"]')?.scrollIntoView({ block: "center" });
  }, [open, view]);

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      btnRef.current?.focus();
      return;
    }
    if (view !== "days" || !focus) return;
    const move = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      PageUp: () => addMonths(focus, -1),
      PageDown: () => addMonths(focus, 1),
      Home: () => addMonths(focus, -12),
      End: () => addMonths(focus, 12),
    }[e.key];
    if (move) {
      e.preventDefault();
      setFocus(clamp(move()));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(focus);
    }
  }

  function shiftMonth(n) {
    setFocus(clamp(addMonths(toISO(shown.y, shown.m, 1), n)));
  }

  const years = useMemo(() => {
    const list = [];
    for (let y = maxYear; y >= minYear; y--) list.push(y);
    return list;
  }, [minYear, maxYear]);

  // the 6x7 grid of days for the month on display
  const cells = useMemo(() => {
    if (!shown) return [];
    const lead = weekday(shown.y, shown.m, 1);
    const total = daysIn(shown.y, shown.m);
    const out = [];
    for (let i = 0; i < lead; i++) out.push(null);
    for (let d = 1; d <= total; d++) out.push(toISO(shown.y, shown.m, d));
    return out;
  }, [shown?.y, shown?.m]); // eslint-disable-line react-hooks/exhaustive-deps

  const base = "flex w-full items-center justify-between gap-2 border text-left outline-none transition disabled:opacity-50";
  let buttonCls;
  if (variant === "public") {
    buttonCls = `${base} h-[48px] rounded-md ${withIcon ? "pl-11 pr-3" : "pl-3.5 pr-3"} text-[14.5px] font-medium text-ink ${
      invalid ? "border-[#e0242b] bg-[#fff8f8]" : open ? "border-brand bg-white ring-4 ring-brand/15" : "border-[#b9cbe6] bg-[#fbfdff] hover:border-[#7fa0d6]"
    }`;
  } else if (variant === "form") {
    buttonCls = `${base} h-[50px] rounded-xl ${withIcon ? "pl-10 pr-3.5" : "px-4"} text-[15px] font-medium text-[#082a63] ${
      invalid ? "border-red-400 bg-red-50" : open ? "border-[#1b57d8] bg-white ring-4 ring-[#1b57d8]/15" : "border-[#d3e1f5] bg-[#f4f8fe] hover:border-[#a9bde0]"
    }`;
  } else {
    buttonCls = `${base} rounded-xl bg-white font-semibold text-[#082a63] ${size === "lg" ? "h-11 px-3.5 text-[15px]" : "h-10 px-3 text-[14px]"} ${
      open ? "border-[#1b57d8] ring-2 ring-[#1b57d8]/15" : "border-[#d3e1f5] hover:border-[#a9bde0] focus-visible:border-[#1b57d8]"
    }`;
  }

  const popStyle = pos
    ? { position: "fixed", ...(pos.up ? { bottom: pos.bottom } : { top: pos.top }), left: pos.left, width: pos.width, maxHeight: pos.maxH }
    : undefined;

  const navBtn = "inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#3d5688] transition hover:bg-[#eaf2fd] disabled:opacity-30";
  const headBtn = "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[15px] font-bold text-[#082a63] transition hover:bg-[#eaf2fd]";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${uid}-cal`}
        aria-label={ariaLabel}
        className={buttonCls}
      >
        <span className={`truncate ${selected ? "" : "font-normal text-[#8a97b3]"}`}>{selected ? display(selected) : placeholder}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-[#4a6090]" />
      </button>

      {open &&
        pos &&
        shown &&
        createPortal(
          <div
            ref={popRef}
            id={`${uid}-cal`}
            role="dialog"
            aria-label="Choose date"
            onKeyDown={onKeyDown}
            style={popStyle}
            className="z-[300] overflow-y-auto overscroll-contain rounded-2xl border border-[#d3e1f5] bg-white p-3 shadow-[0_14px_40px_rgba(8,42,99,0.22)]"
          >
            {/* header */}
            <div className="mb-2 flex items-center justify-between gap-1">
              {view === "days" ? (
                <button type="button" aria-label="Previous month" className={navBtn} onClick={() => shiftMonth(-1)}
                  disabled={!!minISO && toISO(shown.y, shown.m, 1) <= minISO.slice(0, 8) + "01"}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : (
                <span className="h-9 w-9" />
              )}
              <div className="flex items-center gap-0.5">
                <button type="button" className={headBtn} onClick={() => setView(view === "months" ? "days" : "months")} aria-label="Choose month">
                  {MONTHS[shown.m - 1]} <ChevronDown className={`h-4 w-4 transition-transform ${view === "months" ? "rotate-180" : ""}`} />
                </button>
                <button type="button" className={headBtn} onClick={() => setView(view === "years" ? "days" : "years")} aria-label="Choose year">
                  {shown.y} <ChevronDown className={`h-4 w-4 transition-transform ${view === "years" ? "rotate-180" : ""}`} />
                </button>
              </div>
              {view === "days" ? (
                <button type="button" aria-label="Next month" className={navBtn} onClick={() => shiftMonth(1)}
                  disabled={!!maxISO && toISO(shown.y, shown.m, daysIn(shown.y, shown.m)) >= maxISO}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <span className="h-9 w-9" />
              )}
            </div>

            {view === "days" && (
              <>
                <div className="grid grid-cols-7 text-center text-[12.5px] font-bold uppercase text-[#4a6090]">
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="py-1.5">{w}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-0.5 text-center">
                  {cells.map((iso, i) => {
                    if (!iso) return <span key={`b${i}`} />;
                    const isSel = iso === selected;
                    const isToday = iso === today;
                    const ok = inRange(iso);
                    return (
                      <button
                        key={iso}
                        type="button"
                        data-iso={iso}
                        tabIndex={iso === focus ? 0 : -1}
                        disabled={!ok}
                        onClick={() => pick(iso)}
                        aria-label={display(iso)}
                        aria-pressed={isSel}
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-semibold transition outline-none
                          ${isSel ? "bg-[#082a63] text-white shadow-sm" : isToday ? "border border-[#1b57d8] text-[#1245b8]" : "text-[#082a63] hover:bg-[#eaf2fd]"}
                          ${!ok ? "cursor-not-allowed opacity-30 hover:bg-transparent" : ""}
                          focus-visible:ring-2 focus-visible:ring-[#1b57d8]`}
                      >
                        {+iso.slice(8)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {view === "months" && (
              <div className="grid grid-cols-3 gap-1.5 py-1">
                {MONTHS.map((name, i) => {
                  const m = i + 1;
                  const first = toISO(shown.y, m, 1);
                  const last = toISO(shown.y, m, daysIn(shown.y, m));
                  const ok = (!maxISO || first <= maxISO) && (!minISO || last >= minISO); // the month overlaps the allowed range
                  const cur = m === shown.m;
                  return (
                    <button
                      key={name}
                      type="button"
                      disabled={!ok}
                      onClick={() => {
                        setFocus(clamp(toISO(shown.y, m, Math.min(shown.d, daysIn(shown.y, m)))));
                        setView("days");
                      }}
                      className={`rounded-xl py-3 text-[14.5px] font-semibold transition ${cur ? "bg-[#082a63] text-white" : "text-[#082a63] hover:bg-[#eaf2fd]"} ${!ok ? "cursor-not-allowed opacity-30" : ""}`}
                    >
                      {name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            )}

            {view === "years" && (
              <div className="grid max-h-[256px] grid-cols-4 gap-1.5 overflow-y-auto overscroll-contain py-1 pr-1">
                {years.map((y) => {
                  const cur = y === shown.y;
                  return (
                    <button
                      key={y}
                      type="button"
                      data-cur={cur ? "1" : undefined}
                      onClick={() => {
                        setFocus(clamp(toISO(y, shown.m, Math.min(shown.d, daysIn(y, shown.m)))));
                        setView("days");
                      }}
                      className={`rounded-xl py-2.5 text-[14.5px] font-semibold transition ${cur ? "bg-[#082a63] text-white" : "text-[#082a63] hover:bg-[#eaf2fd]"}`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}

            {/* footer */}
            <div className="mt-2 flex items-center justify-between border-t border-[#eaf2fd] pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  btnRef.current?.focus();
                }}
                className="rounded-lg px-3 py-1.5 text-[14px] font-bold text-[#4a6090] transition hover:bg-[#f4f8fe]"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={!inRange(today)}
                onClick={() => pick(today)}
                className="rounded-lg px-3 py-1.5 text-[14px] font-bold text-[#1245b8] transition hover:bg-[#eaf2fd] disabled:opacity-40"
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
