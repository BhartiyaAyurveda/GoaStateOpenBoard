import Link from "next/link";
import {
  CalendarDays,
  Megaphone,
  Link2,
  FileText,
  ArrowRight,
  Info,
} from "lucide-react";
import Calendar from "./Calendar";
import NoticeTicker from "./NoticeTicker";
import { formatNoticeDate } from "@/lib/notices";
import { getNotices } from "@/lib/notices-server";

// latest 7 notices for the auto-scrolling board (full list is on /notices)

// href: a PDF in /public/forms opens in a new tab; "#" = page not available yet
const quickLinks = [
  { text: "Admission Form Class X", href: "/forms/Admission-Form-Class-X.pdf" },
  { text: "Admission Form Class XII", href: "/forms/Admission-Form-Class-XII.pdf" },
  { text: "Affiliation Form", href: "/forms/Affiliation-Form.pdf" },
];

function Panel({ icon: Icon, title, action, children }) {
  return (
    <div className="card-shadow flex flex-col overflow-hidden rounded-lg bg-white">
      <div className="flex h-[56px] items-center justify-between bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-3.5">
        <h3 className="flex items-center gap-2 font-serif text-[22px] font-bold leading-none tracking-tight text-ink">
          <Icon size={26} strokeWidth={1.8} className="text-navy" />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default async function InfoPanels() {
  const notices = (await getNotices()).slice(0, 7).map((n) => ({ text: n.text, date: formatNoticeDate(n.date), isNew: n.isNew }));
  return (
    <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[256fr_400fr_240fr]">
      <Panel icon={CalendarDays} title="Academic Calendar">
        <Calendar />
      </Panel>

      <Panel
        icon={Megaphone}
        title="Latest Notices"
        action={
          <Link href="/notices" className="flex items-center gap-1 text-[14px] font-bold text-ink hover:text-brand">
            View All <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        }
      >
        <NoticeTicker notices={notices} />
      </Panel>

      <Panel icon={Link2} title="Quick Links">
        <ul className="px-4 py-1">
          {quickLinks.map(({ text, href }) => (
            <li
              key={text}
              className="group flex min-h-[84px] items-center border-b border-dashed border-[#9db7e0] last:border-0 hover:bg-[#f2f7fe]"
            >
              <a
                href={href}
                {...(href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex w-full items-center gap-3 py-3 text-ink group-hover:text-brand"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-navy">
                  <FileText size={22} strokeWidth={1.6} />
                </span>
                <span className="flex-1 text-[14.5px] font-semibold leading-snug">{text}</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-navy text-white transition group-hover:bg-brand">
                  <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mx-4 mb-4 mt-auto flex items-start gap-2.5 rounded border border-[#c9daf2] bg-[#eef4fc] px-3.5 py-3 text-[13.5px] font-medium leading-relaxed text-[#44557a]">
          <Info size={17} strokeWidth={2} className="mt-px shrink-0 text-brand" />
          Forms open as PDF. Print, fill in block letters and submit as per the instructions in the Prospectus.
        </p>
      </Panel>
    </section>
  );
}
