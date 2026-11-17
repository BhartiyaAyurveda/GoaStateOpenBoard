"use client";

import { useMemo, useState } from "react";
import { Building2, ExternalLink, Mail, MapPin, Navigation, Phone, Search, X } from "lucide-react";

// "Station Road, Margao" + city "Margao" -> do not repeat the city / state
function fullAddress(c) {
  const parts = [c.address];
  const has = (v) => (c.address || "").toLowerCase().includes(v.toLowerCase());
  if (c.city && !has(c.city)) parts.push(c.city);
  if (c.state && !has(c.state)) parts.push(c.state);
  return parts.filter(Boolean).join(", ");
}

const mapsUrl = (c) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.name, fullAddress(c)].filter(Boolean).join(", "))}`;

const actionCls =
  "inline-flex h-[40px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded border border-[#b9cbe6] bg-white px-3 text-[13.5px] font-bold text-ink transition hover:border-navy hover:bg-navy hover:text-white";

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
            className="h-[48px] w-full rounded-md border border-[#b9cbe6] bg-[#fbfdff] pl-10 pr-10 text-[14.5px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
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

      <p className="mt-5 text-[14px] font-semibold text-[#44557a]" aria-live="polite">
        {query || state !== "All" ? `${shown.length} of ${centres.length} study ${centres.length === 1 ? "centre" : "centres"} match` : `${centres.length} study ${centres.length === 1 ? "centre" : "centres"}`}
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
          {shown.map((c) => {
            const address = fullAddress(c);
            return (
              <li key={c.id} className="card-shadow group flex min-w-0 flex-col overflow-hidden rounded-lg border-t-[3px] border-brand bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start gap-3.5 px-5 pb-3 pt-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#eaf2fd] text-navy">
                    <Building2 size={24} strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    {c.code && <p className="text-[12px] font-bold uppercase tracking-wider text-brand">{c.code}</p>}
                    <h3 className="break-words font-serif text-[20px] font-bold leading-snug text-ink">{c.name}</h3>
                    {c.city && (
                      <p className="mt-0.5 flex items-center gap-1 text-[13.5px] font-semibold text-[#44557a]">
                        <MapPin size={13} aria-hidden="true" /> {[c.city, c.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 px-5 pb-4 text-[14.5px] font-medium text-ink">
                  {c.type && (
                    <p className="w-fit rounded-full border border-[#c9daf2] bg-[#f4f8fe] px-3 py-1 text-[12.5px] font-bold text-[#44557a]">{c.type}</p>
                  )}

                  <dl className="space-y-2 border-t border-dashed border-[#c9daf2] pt-3">
                    {address && (
                      <div className="flex items-start gap-2.5">
                        <dt className="sr-only">Address</dt>
                        <MapPin size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                        <dd className="min-w-0 break-words leading-snug">{address}</dd>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2.5">
                        <dt className="sr-only">Phone</dt>
                        <Phone size={16} className="shrink-0 text-brand" aria-hidden="true" />
                        <dd>{c.tel ? <a href={c.tel} className="font-bold hover:text-brand hover:underline">{c.phone}</a> : c.phone}</dd>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2.5">
                        <dt className="sr-only">Email</dt>
                        <Mail size={16} className="shrink-0 text-brand" aria-hidden="true" />
                        <dd className="min-w-0"><a href={`mailto:${c.email}`} className="break-all font-bold hover:text-brand hover:underline">{c.email}</a></dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className={`mt-auto flex flex-wrap gap-2 border-t border-[#e4edf9] bg-[#f8fbff] px-5 py-3.5 ${c.tel || address || c.website ? "" : "hidden"}`}>
                  {c.tel && (
                    <a href={c.tel} className={actionCls}>
                      <Phone size={15} aria-hidden="true" /> Call
                    </a>
                  )}
                  {address && (
                    <a href={mapsUrl(c)} target="_blank" rel="noopener noreferrer" className={actionCls}>
                      <Navigation size={15} aria-hidden="true" /> Directions
                    </a>
                  )}
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className={actionCls}>
                      <ExternalLink size={15} aria-hidden="true" /> Website
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
