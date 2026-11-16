"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, FileText, Search, SearchX } from "lucide-react";
import { NOTICE_CATEGORIES, formatNoticeDate } from "@/lib/notices";

const PAGE_SIZE = 8;
const CAT_STYLE = {
  Admission: "border-[#a9c3f3] bg-[#eaf1ff] text-[#1f4fb8]",
  Examination: "border-[#f1c98a] bg-[#fff3e0] text-[#9a5a05]",
  "Study Centres": "border-[#a7d8b4] bg-[#eaf7ee] text-[#166534]",
  General: "border-[#c4cde0] bg-[#f1f4f9] text-[#44557a]",
};
function CatTag({ cat }) {
  return <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12.5px] font-bold ${CAT_STYLE[cat]}`}>{cat}</span>;
}

export default function NoticesList({ notices: NOTICES = [] }) {
  const COUNTS = Object.fromEntries(NOTICE_CATEGORIES.map((c) => [c, NOTICES.filter((n) => n.cat === c).length]));
  const YEARS = [...new Set(NOTICES.map((n) => n.date.slice(0, 4)))].sort().reverse();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [year, setYear] = useState("All");
  const [page, setPage] = useState(1);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NOTICES.filter(
      (n) =>
        (cat === "All" || n.cat === cat) &&
        (year === "All" || n.date.startsWith(year)) &&
        (!q || n.text.toLowerCase().includes(q)),
    );
  }, [NOTICES, query, cat, year]);

  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = items.length ? (current - 1) * PAGE_SIZE + 1 : 0;

  const reset = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  return (
    <div className="p-5 sm:p-7">
      {/* filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search size={18} strokeWidth={1.9} className="pointer-events-none absolute left-3.5 top-[15px] text-[#5b78a8]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => reset(setQuery)(e.target.value)}
            maxLength={80}
            placeholder="Search notices..."
            aria-label="Search notices"
            className="h-[48px] w-full rounded-md border border-[#b9cbe6] bg-[#fbfdff] pl-11 pr-3 text-[14.5px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] hover:border-[#7fa0d6] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
          />
        </div>
        <div className="relative">
          <CalendarDays size={18} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-[15px] text-[#5b78a8]" aria-hidden="true" />
          <select
            value={year}
            onChange={(e) => reset(setYear)(e.target.value)}
            aria-label="Filter by year"
            className="h-[48px] w-full cursor-pointer appearance-none rounded-md border border-[#b9cbe6] bg-[#fbfdff] pl-11 pr-10 text-[14.5px] font-medium text-ink outline-none transition hover:border-[#7fa0d6] focus:border-brand focus:ring-4 focus:ring-brand/15"
          >
            <option value="All">All years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown size={18} strokeWidth={2.2} className="pointer-events-none absolute right-3.5 top-[15px] text-[#5b78a8]" aria-hidden="true" />
        </div>
      </div>

      <div role="group" aria-label="Filter by category" className="mt-4 flex flex-wrap gap-2">
        {["All", ...NOTICE_CATEGORIES].map((c) => {
          const active = cat === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => reset(setCat)(c)}
              className={`rounded-full border px-4 py-1.5 text-[14px] font-bold transition ${
                active ? "border-navy bg-navy text-white shadow-sm" : "border-[#b9cbe6] bg-[#f4f8fe] text-ink hover:border-navy hover:bg-white"
              }`}
            >
              {c}
              <span className={`ml-1.5 rounded-full px-1.5 text-[12px] ${active ? "bg-white/20" : "bg-[#dfe8f7] text-[#44557a]"}`}>
                {c === "All" ? NOTICES.length : COUNTS[c]}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[13.5px] font-semibold text-[#5b6b8c]" aria-live="polite">
        {items.length ? `Showing ${from}–${from + slice.length - 1} of ${items.length} notices` : "0 notices"}
      </p>

      {slice.length ? (
        <>
          {/* table on larger screens */}
          <div className="mt-2 hidden overflow-hidden border border-[#9db7e0] md:block">
            <table className="w-full table-fixed border-collapse text-[14px]">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="w-[60px] border-r border-white/20 px-3 py-2.5 text-center text-[13.5px] font-bold">Sr.</th>
                  <th className="border-r border-white/20 px-4 py-2.5 text-left text-[13.5px] font-bold">Notice</th>
                  <th className="w-[140px] border-r border-white/20 px-3 py-2.5 text-center text-[13.5px] font-bold">Category</th>
                  <th className="w-[120px] border-r border-white/20 px-3 py-2.5 text-center text-[13.5px] font-bold">Date</th>
                  <th className="w-[96px] px-3 py-2.5 text-center text-[13.5px] font-bold">View</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((n, i) => (
                  <tr key={n.text} className={`border-t border-[#c9daf2] transition hover:bg-[#f2f7fe] ${i % 2 ? "bg-[#f9fbff]" : ""}`}>
                    <td className="px-3 py-3 text-center font-semibold text-[#44557a]">{from + i}</td>
                    <td className="px-4 py-3 font-semibold leading-snug text-ink">
                      {n.text}
                      {n.isNew && (
                        <span className="animate-blink ml-2 rounded-sm bg-[#e0242b] px-1.5 py-[2px] align-middle text-[10.5px] font-extrabold tracking-wider text-white">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <CatTag cat={n.cat} />
                    </td>
                    <td className="px-3 py-3 text-center text-[14px] font-semibold text-ink">{formatNoticeDate(n.date)}</td>
                    <td className="px-3 py-3 text-center">
                      <ViewLink n={n} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* cards on mobile */}
          <ul className="mt-2 divide-y divide-dashed divide-[#9db7e0] border-y border-[#9db7e0] md:hidden">
            {slice.map((n) => (
              <li key={n.text} className="flex items-start gap-3 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-navy">
                  <FileText size={20} strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold leading-snug text-ink">
                    {n.text}
                    {n.isNew && (
                      <span className="animate-blink ml-2 rounded-sm bg-[#e0242b] px-1.5 py-[2px] align-middle text-[10.5px] font-extrabold tracking-wider text-white">
                        NEW
                      </span>
                    )}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[13px] font-semibold text-[#5b6b8c]">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} strokeWidth={2} /> {formatNoticeDate(n.date)}
                    </span>
                    <CatTag cat={n.cat} />
                  </p>
                  {n.href && (
                    <div className="mt-2">
                      <ViewLink n={n} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* pagination */}
          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(current - 1)}
                disabled={current === 1}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center border border-[#9db7e0] bg-white text-navy transition hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-navy"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === current ? "page" : undefined}
                  className={`h-9 min-w-9 border px-2 text-[14px] font-bold transition ${
                    p === current ? "border-navy bg-navy text-white" : "border-[#9db7e0] bg-white text-ink hover:bg-[#eef4fc]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(current + 1)}
                disabled={current === pages}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center border border-[#9db7e0] bg-white text-navy transition hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-navy"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-2 border border-dashed border-[#9db7e0] bg-[#f7faff] px-4 py-10 text-center">
          <SearchX size={34} strokeWidth={1.5} className="text-[#5b78a8]" aria-hidden="true" />
          <p className="text-[15px] font-bold text-ink">No notice matches your search.</p>
          <p className="text-[14px] font-medium text-[#44557a]">Try different words, or change the category or year.</p>
        </div>
      )}
    </div>
  );
}

// opens a PDF in a new tab, an internal page in the same tab; nothing if the file is not uploaded yet
function ViewLink({ n }) {
  if (!n.href) {
    return (
      <span className="text-[16px] font-bold text-[#b6c1d6]" title="File not uploaded yet" aria-label="File not uploaded yet">
        &ndash;
      </span>
    );
  }
  const pdf = n.href.endsWith(".pdf");
  return (
    <Link
      href={n.href}
      {...(pdf ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 border border-navy bg-white px-3 py-1 text-[13.5px] font-bold text-navy transition hover:bg-navy hover:text-white"
    >
      {pdf ? "PDF" : "Open"} <ExternalLink size={13} strokeWidth={2.2} />
    </Link>
  );
}
