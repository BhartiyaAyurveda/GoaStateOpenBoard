import Link from "next/link";
import SectionTitle from "./SectionTitle";
import { getHomeContent } from "@/lib/home-content";
import { homeLinkProps } from "@/lib/home-defaults";
import { iconByName } from "@/lib/home-icons";

export default async function Services() {
  const { services, syllabus } = await getHomeContent();
  const OLD_SYLLABUS = "/downloads/Syllabus-2026-27.pdf"; // the original link; it now follows the uploaded Syllabus PDF
  return (
    <section className="mt-12">
      <SectionTitle>Our Services</SectionTitle>
      <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {services.map(({ label, icon, href: rawHref }, i) => {
          const href = rawHref === OLD_SYLLABUS ? syllabus.url : rawHref;
          const Icon = iconByName(icon);
          return (
            <Link
              key={`${i}-${label}`}
              href={href}
              {...homeLinkProps(href)}
              className="card-shadow flex h-[156px] flex-col items-center justify-center rounded-lg bg-gradient-to-b from-white to-[#e4edf9] px-3 text-center transition hover:-translate-y-0.5"
            >
              <Icon size={50} strokeWidth={1.4} className="text-brand" />
              <span className="mt-3 text-balance text-[16.5px] font-bold leading-[1.25] text-ink">{label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
