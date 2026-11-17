import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";

const points = [
  "Secondary (Class X) and Senior Secondary (Class XII)",
  "Flexible study at your own pace",
  "Support through study centres and contact classes",
];

export default function About() {
  return (
    <section id="about" className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
      <div className="order-2 lg:order-1">
        <p className="text-[13.5px] font-bold uppercase tracking-[0.2em] text-brand">About Us</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[36px]">About Goa State Open School</h2>
        <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          <span className="h-[3px] w-14 bg-brand" />
          <span className="h-[3px] w-3 bg-[#9db7e0]" />
        </div>

        <p className="mt-5 max-w-[560px] text-[16px] font-medium leading-[1.75] text-ink">
          Goa State Open School is an open schooling institution. It provides an alternative and flexible mode of education for learners who are unable to pursue regular schooling.
        </p>

        <ul className="mt-5 max-w-[560px] space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px] font-semibold leading-snug text-ink">
              <CheckCircle2 size={20} strokeWidth={1.9} className="mt-px shrink-0 text-[#16a34a]" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/about"
            className="inline-flex h-[44px] items-center gap-2 rounded-md bg-navy px-6 text-[14px] font-bold text-white shadow-md shadow-blue-900/20 transition hover:bg-brand"
          >
            Read More <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
          <Link
            href="/programmes/class-x"
            className="inline-flex h-[44px] items-center gap-2 rounded-md border border-navy bg-white px-6 text-[14px] font-bold text-navy transition hover:bg-[#eef4fc]"
          >
            View Programmes
          </Link>
        </div>
      </div>

      <div className="relative order-1 lg:order-2">
        {/* decorative offset frame */}
        <div className="absolute -bottom-3 -right-3 hidden h-full w-full rounded-xl bg-gradient-to-br from-[#cfe0f7] to-[#9db7e0] lg:block" aria-hidden="true" />
        <div className="relative h-[260px] overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 sm:h-[340px] lg:h-[400px]">
          <Image
            src="/images/about-fort.webp"
            alt="Aguada Fort lighthouse, Goa"
            fill
            sizes="(min-width: 1024px) 620px, 100vw"
            className="object-cover object-[60%_50%]"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-deep/70 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-md bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white">
              <GraduationCap size={20} strokeWidth={1.8} />
            </span>
            <p className="text-[14px] font-bold leading-tight text-ink">
              Recognised Open Schooling
              <span className="block text-[12.5px] font-semibold text-[#5b6b8c]">Class X &amp; Class XII</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
