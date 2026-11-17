"use client";

import { useMemo, useState } from "react";
import { Building2, ExternalLink, Mail, MapPin, Phone, Search, X } from "lucide-react";

export default function StudyCentresList({ centres }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All");

  const states = useMemo(() => ["All", ...Array.from(new Set(centres.map((c) => c.state).filter(Boolean)))], [centres]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return centres.filter((c) => {
      if (state !== "All" && c.state !== state) return false;
      if (!q) return true;
      return [c.name, c.city, c.state, c.code, c.type, c.address].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [centres, query, state]);

  return (
    <div>
      <div className="card-shadow flex flex-col gap-3 rounded-lg bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5b78a8]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by centre name, city or code…"
            aria-label="Search study centres"
            className="h-[46px] w-full rounded-md border border-[#b9cbe6] bg-[#fbfdff] pl-10 pr-10 text-[14.5px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#5b78a8] hover:bg-[#eef4fc]">
              <X size={16} />
            </button>
          )}
        </div>
        {states.length > 2 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by state">
            {states.map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                aria-pressed={state === s}
                className={`h-[40px] rounded-md border px-4 text-[14px] font-bold transition ${
                  state === s ? "border-navy bg-navy text-white" : "border-[#b9cbe6] bg-white text-ink hover:bg-[#f2f7fe]"
                }`}
              >
                {s === "All" ? "All states" : s}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-[14px] font-semibold text-[#44557a]" aria-live="polite">
        Showing {shown.length} of {centres.length} study {centres.length === 1 ? "centre" : "centres"}
      </p>

      {shown.length === 0 ? (
        <div className="card-shadow mt-3 rounded-lg bg-white px-6 py-14 text-center">
          <Building2 size={42} strokeWidth={1.4} className="mx-auto text-[#9db7e0]" />
          <p className="mt-3 text-[17px] font-bold text-ink">No study centre matches your search</p>
          <button onClick={() => { setQuery(""); setState("All"); }} className="mt-4 h-[40px] rounded border border-navy px-5 text-[14px] font-bold text-ink hover:bg-navy hover:text-white">
            Clear search
          </button>
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => (
            <li key={c.id} className="card-shadow flex min-w-0 flex-col overflow-hidden rounded-lg bg-white">
              <div className="flex items-start gap-3 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-4 py-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-white text-navy">
                  <Building2 size={22} strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  {c.code && <p className="text-[12px] font-bold uppercase tracking-wider text-brand">{c.code}</p>}
                  <h3 className="break-words font-serif text-[18px] font-bold leading-snug text-ink">{c.name}</h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 px-4 py-4 text-[14.5px] font-medium text-ink">
                {c.type && <p className="w-fit rounded border border-[#c9daf2] bg-[#f4f8fe] px-2.5 py-1 text-[13px] font-semibold text-[#44557a]">{c.type}</p>}

                {(c.address || c.city || c.state) && (
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                    <span className="min-w-0 break-words">{[c.address, c.city, c.state].filter(Boolean).join(", ")}</span>
                  </p>
                )}
                {c.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="shrink-0 text-brand" aria-hidden="true" />
                    {c.tel ? <a href={c.tel} className="font-bold hover:text-brand hover:underline">{c.phone}</a> : c.phone}
                  </p>
                )}
                {c.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={16} className="shrink-0 text-brand" aria-hidden="true" />
                    <a href={`mailto:${c.email}`} className="min-w-0 break-all font-bold hover:text-brand hover:underline">{c.email}</a>
                  </p>
                )}
                {c.website && (
                  <a href={c.website} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-2 pt-1 font-bold text-brand hover:underline">
                    <ExternalLink size={15} aria-hidden="true" /> Visit website
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
