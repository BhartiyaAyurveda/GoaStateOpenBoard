import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Page frame for the standalone Super Admin sub-pages (they sit outside the dashboard sidebar):
// sticky top bar with a way back, and a padded, centred content area.
export default function AdminPageShell({ title, subtitle, backHref = "/super-admin/dashboard", backLabel = "Dashboard", actions, children }) {
  return (
    <div className="min-h-screen bg-[#f0f5fd]">
      <header className="sticky top-0 z-30 border-b border-[#d3e1f5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href={backHref}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-3 text-[14px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{backLabel}</span>
          </Link>
          <div className="min-w-0 flex-1 border-l-4 border-[#1b57d8] pl-3">
            <h1 className="truncate text-[18px] font-extrabold leading-tight text-[#082a63] sm:text-[21px]">{title}</h1>
            {subtitle && <p className="truncate text-[13px] text-[#3d5688] sm:text-[14px]">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-5 sm:px-6 sm:py-6">{children}</main>
    </div>
  );
}
