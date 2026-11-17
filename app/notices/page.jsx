import { getContactInfo } from "@/lib/site-settings";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  ChartColumn,
  ChevronRight,
  FileText,
  Files,
  GraduationCap,
  Headphones,
  IdCard,
  Link2,
  Megaphone,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoticesList from "@/components/NoticesList";
import { formatNoticeDate } from "@/lib/notices";
import { getNotices } from "@/lib/notices-server";

export const revalidate = 60;

export const metadata = {
  title: "Notices | Goa State Open School",
  description: "All notices and circulars of Goa State Open School – admission, examination, study centres and general notices.",
};

const quick = [
  { text: "Check Result", href: "/result", icon: ChartColumn },
  { text: "Download Admit Card", href: "/admit-card", icon: IdCard },
  { text: "Admission Form Class X", href: "/forms/Admission-Form-Class-X.pdf", icon: FileText, pdf: true },
  { text: "Admission Form Class XII", href: "/forms/Admission-Form-Class-XII.pdf", icon: FileText, pdf: true },
  { text: "Programme Details", href: "/programmes/class-x", icon: GraduationCap },
];

function Panel({ icon: Icon, title, children }) {
  return (
    <section className="card-shadow overflow-hidden rounded-lg bg-white">
      <div className="flex h-[52px] items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5">
        <Icon size={22} strokeWidth={1.8} className="text-navy" />
        <h2 className="text-[19px] font-bold leading-none tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default async function NoticesPage() {
  const contact = await getContactInfo();
  const NOTICES = await getNotices();
  const total = NOTICES.length;
  const fresh = NOTICES.filter((n) => n.isNew).length;
  const latest = NOTICES[0];

  const stats = [
    { icon: Files, value: total, label: "Total notices" },
    { icon: BellRing, value: fresh, label: "New notices" },
    { icon: CalendarDays, value: formatNoticeDate(latest.date), label: "Last updated" },
  ];

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
              Notices
            </span>
          </nav>

          {/* heading band with summary */}
          <div className="mt-4 flex flex-col gap-5 border-l-[6px] border-navy bg-gradient-to-r from-[#e3edfa] to-white px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#44557a]">Goa State Open School <span lang="kok" className="font-devanagari normal-case tracking-normal"> · गोंय राज्य मुक्त शाळा</span></p>
              <h1 className="mt-1 flex items-center gap-3 text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[34px]">
                <Megaphone size={30} strokeWidth={1.8} className="text-navy" aria-hidden="true" />
                Notices &amp; Circulars
              </h1>
              <p className="mt-1.5 max-w-[620px] text-[15px] font-medium leading-relaxed text-[#44557a]">
                Official notices on admission, examinations and study centres. Please check this page regularly for updates.
              </p>
            </div>
            <dl className="grid shrink-0 grid-cols-3 divide-x divide-[#b9cbe6] border border-[#b9cbe6] bg-white">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="px-4 py-3 text-center sm:px-6">
                  <Icon size={18} strokeWidth={1.8} className="mx-auto text-brand" aria-hidden="true" />
                  <dd className="mt-1 text-[17px] font-extrabold leading-tight text-navy sm:text-[19px]">{value}</dd>
                  <dt className="text-[12.5px] font-semibold text-[#5b6b8c]">{label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_330px] lg:items-start lg:py-8">
          <section className="card-shadow overflow-hidden rounded-lg bg-white">
            <NoticesList notices={NOTICES} />
          </section>

          <aside className="space-y-6 lg:sticky lg:top-[76px]">
            <Panel icon={Link2} title="Quick Links">
              <ul className="px-4 py-1">
                {quick.map(({ text, href, icon: Icon, pdf }) => (
                  <li key={text} className="group border-b border-dashed border-[#9db7e0] last:border-0">
                    <Link
                      href={href}
                      {...(pdf ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex min-h-[52px] items-center gap-3 py-2 text-ink group-hover:text-brand"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-navy">
                        <Icon size={18} strokeWidth={1.6} />
                      </span>
                      <span className="flex-1 text-[14px] font-semibold leading-snug">{text}</span>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-navy text-white transition group-hover:bg-brand">
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="card-shadow flex items-center gap-4 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] p-5 text-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <Headphones size={22} strokeWidth={1.7} />
              </span>
              <div className="text-[14px] font-medium leading-snug">
                <p className="text-[13px] font-bold uppercase tracking-wider text-sky">Any queries?</p>
                <p className="text-white/90">Call Goa State Open School on</p>
                <a href={contact.tel} className="text-[22px] font-extrabold leading-tight hover:text-sky">
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
        </div>
      </main>

      <Footer />
    </>
  );
}
