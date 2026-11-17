import { getContactInfo } from "@/lib/site-settings";
import Link from "next/link";
import { ChevronRight, FileText, Headphones, Lock, ScrollText, ShieldAlert, Map } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const LEGAL_PAGES = [
  { key: "disclaimer", label: "Disclaimer", href: "/disclaimer", icon: ShieldAlert },
  { key: "privacy", label: "Privacy Policy", href: "/privacy-policy", icon: Lock },
  { key: "terms", label: "Terms of Use", href: "/terms-of-use", icon: ScrollText },
  { key: "sitemap", label: "Sitemap", href: "/sitemap", icon: Map },
];

export const LAST_UPDATED = "16 November 2026";

// Shared layout for the footer pages. `current` is one of LEGAL_PAGES[].key.
export default async function LegalPage({ current, title, intro, children, showUpdated = true }) {
  const contact = await getContactInfo();
  const page = LEGAL_PAGES.find((p) => p.key === current);
  const Icon = page?.icon ?? FileText;

  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content">
        <div className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[14px] font-semibold text-[#44557a]">
            <Link href="/" className="hover:text-brand">
              Home
            </Link>
            <ChevronRight size={14} strokeWidth={2.5} />
            <span aria-current="page" className="text-ink">
              {title}
            </span>
          </nav>

          <div className="mt-4 border-l-[6px] border-navy bg-gradient-to-r from-[#e3edfa] to-white px-5 py-5 sm:px-7">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#44557a]">Goa State Open School</p>
            <h1 className="mt-1 flex items-center gap-3 text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[34px]">
              <Icon size={30} strokeWidth={1.8} className="shrink-0 text-navy" aria-hidden="true" />
              {title}
            </h1>
            {intro && <p className="mt-1.5 max-w-[760px] text-[15px] font-medium leading-relaxed text-[#44557a]">{intro}</p>}
          </div>
        </div>

        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:items-start lg:py-8">
          <aside className="space-y-6 lg:sticky lg:top-[76px]">
            <nav aria-label="Policies" className="card-shadow overflow-hidden rounded-lg bg-white">
              <div className="flex h-[52px] items-center bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5">
                <h2 className="text-[17px] font-bold text-ink">Website Policies</h2>
              </div>
              <ul className="py-1">
                {LEGAL_PAGES.map(({ key, label, href, icon: I }) => {
                  const active = key === current;
                  return (
                    <li key={key}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 border-l-4 px-5 py-3 text-[14.5px] font-semibold transition-colors ${
                          active ? "border-navy bg-[#eef4fc] text-navy" : "border-transparent text-ink hover:bg-[#f7faff] hover:text-brand"
                        }`}
                      >
                        <I size={18} strokeWidth={1.8} />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="card-shadow flex items-center gap-4 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] p-5 text-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <Headphones size={22} strokeWidth={1.7} />
              </span>
              <div className="text-[14px] font-medium leading-snug">
                <p className="text-[13px] font-bold uppercase tracking-wider text-sky">Any queries?</p>
                <a href={contact.tel} className="text-[20px] font-extrabold leading-tight hover:text-sky">
                  {contact.phone}
                </a>
                <p className="text-white/80">
                  or{" "}
                  <Link href="/contact" className="font-bold underline underline-offset-2 hover:text-sky">
                    write to us
                  </Link>
                  .
                </p>
              </div>
            </div>
          </aside>

          <article className="card-shadow min-w-0 overflow-hidden rounded-lg bg-white">
            {showUpdated && (
              <p className="border-b border-dashed border-[#9db7e0] bg-[#f4f8fe] px-6 py-3 text-[13.5px] font-semibold text-[#5b6b8c] sm:px-9">
                Last updated: {LAST_UPDATED}
              </p>
            )}
            <div className="p-6 sm:p-9">{children}</div>
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Numbered section used by the text policies.
export function PolicySection({ n, heading, children }) {
  return (
    <section className="border-b border-dashed border-[#c9d6ec] py-6 first:pt-0 last:border-0 last:pb-0">
      <h2 className="flex items-start gap-3 text-[19px] font-bold leading-snug text-ink">
        <span className="mt-0.5 flex h-7 min-w-7 items-center justify-center bg-navy px-1.5 text-[14px] font-extrabold text-white">{n}</span>
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] font-medium leading-[1.8] text-ink sm:pl-10">{children}</div>
    </section>
  );
}

export function Bullets({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-3">
          <span className="mt-[11px] h-2 w-2 shrink-0 bg-navy" aria-hidden="true" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

// Reminder shown on every policy page: this text must be reviewed before going live.
export function ReviewNote() {
  return (
    <p className="mt-8 rounded-md border border-[#f3d28a] bg-[#fff8e6] px-4 py-3 text-[13.5px] font-medium leading-relaxed text-[#5a4300]">
      <b>Note for the website owner:</b> this page is general draft text. Have it reviewed by the Directorate of Education / legal
      section and update it to match the actual practices of Goa State Open School before publishing.
    </p>
  );
}
