import Link from "next/link";
import { UserCheck, CalendarDays, BookOpen, Layers, CircleHelp } from "lucide-react";
import SectionTitle from "./SectionTitle";

// href: a PDF in /public opens in a new tab; "#" = page not available yet
const services = [
  { label: ["Student", "Verification"], icon: UserCheck, href: "#" },
  { label: ["Academic", "Schedule"], icon: CalendarDays, href: "#" },
  { label: ["Study", "Material"], icon: BookOpen, href: "#" },
  { label: ["Previous", "Year Papers"], icon: Layers, href: "#" },
  { label: ["Syllabus"], icon: BookOpen, href: "/downloads/Syllabus-2026-27.pdf" },
  { label: ["FAQs"], icon: CircleHelp, href: "/faq" },
];

export default function Services() {
  return (
    <section className="mt-12">
      <SectionTitle>Our Services</SectionTitle>
      <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {services.map(({ label, icon: Icon, href }) => (
          <Link
            key={label.join(" ")}
            href={href}
            {...(href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="card-shadow flex h-[156px] flex-col items-center justify-center rounded-lg bg-gradient-to-b from-white to-[#e4edf9] text-center transition hover:-translate-y-0.5"
          >
            <Icon size={50} strokeWidth={1.4} className="text-brand" />
            <span className="mt-3 text-[16.5px] font-bold leading-[1.25] text-ink">
              {label.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
