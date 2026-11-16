import { Users, Building2, GraduationCap, CalendarDays } from "lucide-react";

const stats = [
  { value: "1,25,000+", label: "Learners Enrolled", icon: Users },
  { value: "450+", label: "Study Centres", icon: Building2 },
  { value: "98%", label: "Pass Percentage", icon: GraduationCap },
  { value: "25+", label: "Years of Service", icon: CalendarDays },
];

// tall: bigger bar for pages whose spacing is handled by the parent (About)
export default function Stats({ tall = false }) {
  return (
    <section
      className={`card-shadow grid grid-cols-2 rounded-lg bg-gradient-to-r from-[#f1f6fd] to-[#e3edfa] lg:grid-cols-4 ${
        tall ? "py-12 sm:py-16" : "mb-10 mt-10 py-9"
      }`}
    >
      {stats.map(({ value, label, icon: Icon }, i) => (
        <div
          key={label}
          className={`flex flex-col items-center justify-center gap-1 px-2 py-3 text-center sm:flex-row sm:gap-3 sm:py-2 sm:text-left ${i > 0 ? "lg:border-l lg:border-navy/40" : ""}`}
        >
          <Icon strokeWidth={1.4} className="size-10 shrink-0 text-brand sm:size-14" />
          <div className="leading-tight">
            <p className="font-serif text-[24px] font-bold tracking-tight sm:text-[28px] text-ink">{value}</p>
            <p className="text-[14.5px] font-medium text-ink">{label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
