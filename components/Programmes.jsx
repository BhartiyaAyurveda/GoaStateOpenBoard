import Link from "next/link";
import { GraduationCap, BookOpen, Layers, ArrowRight, Clock } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { getCourses, prettyCategory } from "@/lib/courses-server";

// shown only if no course has been added in the dashboard yet
const FALLBACK = [
  {
    id: "class-x",
    name: "Secondary Programme – Class X",
    about: "A flexible and inclusive programme for learners who wish to complete their secondary education through open schooling.",
    category: "secondary",
    href: "/programmes/class-x",
  },
  {
    id: "class-xii",
    name: "Senior Secondary Programme – Class XII",
    about: "A senior secondary programme that provides greater academic flexibility and diverse subject options for higher education and career advancement.",
    category: "senior_secondary",
    href: "/programmes/class-xii",
  },
];

const iconFor = (category) => (category === "secondary" ? GraduationCap : category === "senior_secondary" ? BookOpen : Layers);

export default async function Programmes() {
  const courses = await getCourses();
  const items = courses.length
    ? courses.map((c) => ({ ...c, href: c.programmeSlug ? `/programmes/${c.programmeSlug}` : `/courses#course-${c.id}` }))
    : FALLBACK;

  return (
    <section className="mt-12">
      <SectionTitle>Programmes Offered</SectionTitle>
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {items.map(({ id, name, local, about, eligibility, category, duration, subjects, href }) => {
          const Icon = iconFor(category);
          const text = about || (eligibility ? `Eligibility: ${eligibility}` : "");
          return (
            <div
              key={id}
              className="card-shadow flex min-h-[220px] flex-col items-start gap-4 rounded-lg bg-gradient-to-br from-white via-[#f3f8fe] to-[#d3e5fa] px-5 py-6 sm:flex-row sm:items-center sm:gap-7 sm:px-8 sm:py-8"
            >
              <Icon strokeWidth={1.2} className="size-14 shrink-0 text-brand sm:size-[76px]" />
              <div className="min-w-0">
                {category && <p className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-brand">{prettyCategory(category)}</p>}
                <h3 className="font-serif text-[23px] font-bold leading-tight tracking-[-0.02em] text-ink">{name}</h3>
                {local && <p className="mt-1 font-devanagari text-[15px] font-semibold text-[#44557a]">{local}</p>}
                {(duration || subjects?.length > 0) && (
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] font-semibold text-[#44557a]">
                    {duration && <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {duration}</span>}
                    {subjects?.length > 0 && <span className="inline-flex items-center gap-1.5"><BookOpen size={14} /> {subjects.length} subjects</span>}
                  </p>
                )}
                {text && <p className="mt-3 max-w-[440px] text-[14.5px] font-medium leading-[1.55] text-ink">{text}</p>}
                <Link
                  href={href}
                  className="mt-5 inline-flex h-[38px] items-center gap-2 rounded border border-navy bg-white px-5 text-[14px] font-bold text-ink hover:bg-navy hover:text-white"
                >
                  View Details <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {courses.length > 0 && (
        <p className="mt-5 text-center">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-brand hover:text-navy">
            See all courses and subjects <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </p>
      )}
    </section>
  );
}
