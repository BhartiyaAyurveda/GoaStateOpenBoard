import Link from "next/link";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import SectionTitle from "./SectionTitle";

const programmes = [
  {
    title: "Secondary Programme – Class X",
    desc: "A flexible and inclusive programme for learners who wish to complete their secondary education through open schooling.",
    icon: GraduationCap,
    href: "/programmes/class-x",
  },
  {
    title: "Senior Secondary Programme – Class XII",
    desc: "A senior secondary programme that provides greater academic flexibility and diverse subject options for higher education and career advancement.",
    icon: BookOpen,
    href: "/programmes/class-xii",
  },
];

export default function Programmes() {
  return (
    <section className="mt-12">
      <SectionTitle>Programmes Offered</SectionTitle>
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {programmes.map(({ title, desc, icon: Icon, href }) => (
          <div
            key={title}
            className="card-shadow flex min-h-[220px] flex-col items-start gap-4 rounded-lg bg-gradient-to-br from-white via-[#f3f8fe] to-[#d3e5fa] px-5 py-6 sm:flex-row sm:items-center sm:gap-7 sm:px-8 sm:py-8"
          >
            <Icon strokeWidth={1.2} className="size-14 shrink-0 text-brand sm:size-[76px]" />
            <div>
              <h3 className="font-serif text-[23px] font-bold leading-tight tracking-[-0.02em] text-ink">{title}</h3>
              <p className="mt-3 max-w-[440px] text-[14.5px] font-medium leading-[1.55] text-ink">{desc}</p>
              <Link
                href={href}
                className="mt-5 inline-flex h-[38px] items-center gap-2 rounded border border-navy bg-white px-5 text-[14px] font-bold text-ink hover:bg-navy hover:text-white"
              >
                View Details <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
