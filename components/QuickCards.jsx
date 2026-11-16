import Link from "next/link";
import { ArrowRight, FileText, IdCard, ChartColumn } from "lucide-react";

const cards = [
  { title: "Enrollment Card", sub: "Download your Enrollment Card", icon: FileText, href: "/enrollment-card" },
  { title: "Admit Card", sub: "Download Hall Ticket Examination", icon: IdCard, href: "/admit-card" },
  { title: "Result", sub: "Check Examination Result Online", icon: ChartColumn, href: "/result" },
];

export default function QuickCards() {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {cards.map(({ title, sub, icon: Icon, href }) => (
        <Link
          key={title}
          href={href}
          className="card-shadow group flex min-h-[96px] items-center gap-4 py-3 md:h-[120px] md:gap-5 md:py-0 rounded-lg bg-gradient-to-br from-white to-[#e6effb] px-5 transition hover:-translate-y-0.5"
        >
          <Icon strokeWidth={1.4} className="size-11 shrink-0 text-brand md:size-14" />
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-[21px] font-bold leading-tight md:text-[24px] tracking-tight text-ink">{title}</h3>
            <p className="mt-1 text-[14px] font-medium leading-snug text-ink/90 md:mt-1.5 md:truncate md:text-[14.5px]">{sub}</p>
          </div>
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-navy text-white">
            <ArrowRight size={13} strokeWidth={3} />
          </span>
        </Link>
      ))}
    </section>
  );
}
