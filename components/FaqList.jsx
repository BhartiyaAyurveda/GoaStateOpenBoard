"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown, Search, SearchX } from "lucide-react";
import { FAQ_CATEGORIES, FAQS } from "@/lib/faqs";

export default function FaqList() {
  const uid = useId();
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(0); // index within the filtered list; -1 = none

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter(
      (f) => (cat === "All" || f.cat === cat) && (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
    );
  }, [cat, query]);

  const tabs = ["All", ...FAQ_CATEGORIES];

  return (
    <div className="p-5 sm:p-7">
      {/* search */}
      <div className="relative">
        <Search size={18} strokeWidth={1.9} className="pointer-events-none absolute left-3.5 top-[15px] text-[#5b78a8]" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(0);
          }}
          maxLength={80}
          placeholder="Search your question..."
          aria-label="Search frequently asked questions"
          className="h-[48px] w-full rounded-md border border-[#b9cbe6] bg-[#fbfdff] pl-11 pr-3 text-[14.5px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] hover:border-[#7fa0d6] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
        />
      </div>

      {/* category tabs */}
      <div role="group" aria-label="Filter by category" className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = cat === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setCat(t);
                setOpen(0);
              }}
              className={`rounded-full border px-4 py-1.5 text-[14px] font-bold transition ${
                active
                  ? "border-navy bg-navy text-white shadow-sm"
                  : "border-[#b9cbe6] bg-[#f4f8fe] text-ink hover:border-navy hover:bg-white"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[13.5px] font-semibold text-[#5b6b8c]" aria-live="polite">
        {items.length} {items.length === 1 ? "question" : "questions"}
      </p>

      {/* accordion */}
      {items.length ? (
        <ul className="mt-2 border-t border-[#b9cbe6]">
          {items.map((f, i) => {
            const isOpen = open === i;
            const btnId = `${uid}-b-${i}`;
            const panelId = `${uid}-p-${i}`;
            return (
              <li key={f.q} className="border-b border-[#b9cbe6]">
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className={`flex w-full items-start gap-3 px-1 py-4 text-left transition ${isOpen ? "bg-[#f2f7fe]" : "hover:bg-[#f7faff]"}`}
                  >
                    <span
                      className={`mt-px flex h-7 w-7 shrink-0 items-center justify-center text-[13px] font-extrabold ${
                        isOpen ? "bg-navy text-white" : "bg-[#e3edfa] text-navy"
                      }`}
                      aria-hidden="true"
                    >
                      Q
                    </span>
                    <span className="flex-1 text-[15px] font-bold leading-snug text-ink">{f.q}</span>
                    <ChevronDown
                      size={20}
                      strokeWidth={2.4}
                      className={`mt-0.5 shrink-0 text-navy transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen}>
                  <div className="flex gap-3 bg-[#f2f7fe] px-1 pb-5 pt-1">
                    <span className="mt-px flex h-7 w-7 shrink-0 items-center justify-center bg-[#16a34a] text-[13px] font-extrabold text-white" aria-hidden="true">
                      A
                    </span>
                    <p className="flex-1 text-[14.5px] font-medium leading-[1.7] text-ink">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-2 border border-dashed border-[#9db7e0] bg-[#f7faff] px-4 py-10 text-center">
          <SearchX size={34} strokeWidth={1.5} className="text-[#5b78a8]" aria-hidden="true" />
          <p className="text-[15px] font-bold text-ink">No question matches your search.</p>
          <p className="text-[14px] font-medium text-[#44557a]">Try different words, or contact us and we will help you.</p>
        </div>
      )}
    </div>
  );
}
