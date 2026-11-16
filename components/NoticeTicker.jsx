import { FileText, CalendarDays, ExternalLink } from "lucide-react";

function NoticeRow({ text, date, isNew }) {
  return (
    <li className="border-b border-dashed border-[#9db7e0] hover:bg-[#f2f7fe]">
      <a href="#" className="flex min-h-[84px] items-center gap-3 px-4 py-3 text-ink hover:text-brand">
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

/**
 * Vertical auto-scrolling notice board. The list is rendered twice and the
 * track is translated by -50% in a CSS loop, so it repeats seamlessly.
 * Pauses on hover / keyboard focus; falls back to a normal scrollable list
 * when the user prefers reduced motion.
 */
export default function NoticeTicker({ notices }) {
  const duration = `${Math.max(notices.length * 5, 20)}s`;

  return (
    <div className="notice-ticker relative min-h-[380px] flex-1 overflow-hidden motion-reduce:overflow-y-auto">
      <div className="notice-ticker-track absolute inset-x-0 top-0" style={{ "--ticker-duration": duration }}>
        <ul>
          {notices.map((n) => (
            <NoticeRow key={n.text} {...n} />
          ))}
        </ul>
        <ul aria-hidden="true" className="motion-reduce:hidden">
          {notices.map((n) => (
            <NoticeRow key={`dup-${n.text}`} {...n} />
          ))}
        </ul>
      </div>
      {/* soft fade at the top and bottom edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
