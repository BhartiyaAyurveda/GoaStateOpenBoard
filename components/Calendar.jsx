"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CAL_TYPES, eventsByDate, isoKey } from "@/lib/academic-calendar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MIN_YEAR = 2020;
const MAX_YEAR = 2035;

const fmtLong = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export default function Calendar() {
  // The real "today" is read in the browser after the page loads (the server's
  // date / time zone may differ), so the first render is a neutral placeholder.
  const [today, setToday] = useState(null);
  const [view, setView] = useState(null);
  const [selected, setSelected] = useState(null);
  const events = useMemo(eventsByDate, []);

  useEffect(() => {
    const n = new Date();
    setToday({ y: n.getFullYear(), m: n.getMonth(), d: n.getDate() });
    setView({ year: n.getFullYear(), month: n.getMonth() });
  }, []);

  if (!view || !today) {
    return <div className="min-h-[470px] flex-1" aria-hidden="true" />;
  }

  const todayKey = isoKey(today.y, today.m, today.d);
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: total }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const atMin = view.year === MIN_YEAR && view.month === 0;
  const atMax = view.year === MAX_YEAR && view.month === 11;

  const shift = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      if (d.getFullYear() < MIN_YEAR || d.getFullYear() > MAX_YEAR) return { year, month };
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const monthPrefix = `${view.year}-${String(view.month + 1).padStart(2, "0")}-`;
  const monthEvents = [...events.entries()]
    .filter(([k]) => k.startsWith(monthPrefix))
    .flatMap(([k, list]) => list.map((e) => ({ ...e, date: k })))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const selectedEvents = selected && selected.startsWith(monthPrefix) ? events.get(selected) || [] : [];
  const shown = selected && selected.startsWith(monthPrefix) ? selectedEvents : monthEvents;

  return (
    <div className="flex flex-1 flex-col">
      {/* Month bar */}
      <div className="flex h-[42px] items-center justify-between bg-navy px-2 text-white">
        <button
          onClick={() => shift(-1)}
          disabled={atMin}
          aria-label="Previous month"
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
        <span className="text-[15px] font-bold uppercase tracking-wide" aria-live="polite">
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          onClick={() => shift(1)}
          disabled={atMax}
          aria-label="Next month"
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="border-l border-t border-[#b9cbe6]">
          {/* Weekday header */}
          <div className="grid grid-cols-7 bg-[#e3edfa] text-center text-[13.5px] font-bold">
            {DAYS.map((d) => (
              <span key={d} className={`border-b border-r border-[#b9cbe6] py-1.5 ${d === "Sun" ? "text-[#e0242b]" : "text-ink"}`}>
                {d}
              </span>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 text-center text-[14.5px] font-semibold">
            {cells.map((day, i) => {
              const base = "flex h-[46px] items-center justify-center border-b border-r border-[#b9cbe6]";
              if (!day) return <span key={i} className={`${base} bg-[#f6f9fe]`} />;
              const key = isoKey(view.year, view.month, day);
              const isSun = i % 7 === 0;
              const isToday = key === todayKey;
              const isSel = key === selected;
              const list = events.get(key);
              const label = `${fmtLong(key)}${isToday ? ", today" : ""}${list ? ". " + list.map((e) => e.title).join(". ") : ""}`;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(isSel ? null : key)}
                  aria-label={label}
                  aria-pressed={isSel}
                  className={`${base} relative transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-brand ${
                    isToday
                      ? "bg-navy font-bold text-white ring-2 ring-inset ring-[#f59e0b]"
                      : isSun
                        ? "bg-[#fff1f1] text-[#e0242b] hover:bg-[#ffe3e3]"
                        : "bg-white text-ink hover:bg-[#eef4fc]"
                  } ${isSel && !isToday ? "ring-2 ring-inset ring-brand" : ""}`}
                >
                  {day}
                  {list && (
                    <span className="absolute bottom-[5px] left-1/2 flex -translate-x-1/2 gap-[3px]" aria-hidden="true">
                      {[...new Set(list.map((e) => e.type))].slice(0, 3).map((t) => (
                        <i key={t} className="block h-[5px] w-[5px] rounded-full ring-1 ring-white" style={{ background: CAL_TYPES[t].dot }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 text-[12.5px] font-semibold text-[#44557a]">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
            {Object.entries(CAL_TYPES).map(([k, t]) => (
              <span key={k} className="flex items-center gap-1.5">
                <i className="block h-2 w-2 rounded-full" style={{ background: t.dot }} /> {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="mt-3 border-t border-dashed border-[#9db7e0] pt-3">
          <p className="mb-1.5 text-[13px] font-extrabold uppercase tracking-wider text-navy">
            {selected && selected.startsWith(monthPrefix) ? fmtLong(selected) : `Events in ${MONTHS[view.month]}`}
          </p>
          {shown.length ? (
            <ul className="space-y-1.5">
              {shown.map((e) => (
                <li key={e.date + e.title} className="flex items-start gap-2.5 text-[14px] font-medium leading-snug text-ink">
                  <i className="mt-[5px] block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CAL_TYPES[e.type].dot }} aria-hidden="true" />
                  <span>
                    {!(selected && selected.startsWith(monthPrefix)) && <b className="mr-1.5 text-navy">{Number(e.date.slice(8))} {MONTHS[view.month].slice(0, 3)}</b>}
                    {e.title}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13.5px] font-medium text-[#5b6b8c]">No events{selected && selected.startsWith(monthPrefix) ? " on this day" : " this month"}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
