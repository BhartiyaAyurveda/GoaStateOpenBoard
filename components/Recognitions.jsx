import Image from "next/image";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import SectionTitle from "./SectionTitle";

// Official recognitions shown on the home page. Add or edit entries here.
// `logo` is a small wordmark drawn in JSX; swap it for an <Image> of the official logo whenever a file is available.
const ITEMS = [
  {
    id: "niti",
    tag: "Govt. of India",
    title: "NITI Aayog",
    subtitle: "National Institution for Transforming India",
    text: "Registered with NITI Aayog on the NGO-DARPAN portal.",
    logo: (
      <Image src="/images/niti-aayog.png" alt="NITI Aayog" width={640} height={237} className="h-[112px] w-auto max-w-full object-contain mix-blend-multiply" />
    ),
  },
  {
    id: "msme",
    tag: "Govt. of India",
    title: "MSME",
    subtitle: "Ministry of MSME, Govt. of India",
    text: "Recognized under MSME Trust – Education Act.",
    logo: (
      <Image src="/images/msme.png" alt="MSME – Micro, Small & Medium Enterprises" width={640} height={225} className="h-[112px] w-auto max-w-full object-contain mix-blend-multiply" />
    ),
  },
  {
    id: "azadi",
    tag: "Govt. of India",
    title: "Azadi Ka Amrit Mahotsav",
    subtitle: "Government of India initiative",
    text: "Celebrating 75 years of India’s independence and the glorious history of its people, culture and achievements.",
    logo: (
      // multiply blends the logo's white background into the card
      <Image src="/images/azadi-amrit-mahotsav.png" alt="Azadi Ka Amrit Mahotsav" width={640} height={424} className="h-[112px] w-auto mix-blend-multiply" />
    ),
  },
];

export default function Recognitions() {
  return (
    <section className="py-12" aria-labelledby="recognitions-title">
      <div id="recognitions-title">
        <SectionTitle>Official Recognitions</SectionTitle>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ id, tag, title, subtitle, text, logo }) => (
          <article
            key={id}
            className="card-shadow flex flex-col rounded-lg bg-gradient-to-br from-white via-[#f3f8fe] to-[#e1edfb] p-5 sm:p-6 md:max-lg:last:col-span-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded border border-[#c9daf2] bg-[#eef4fc] px-3 py-1 text-[12.5px] font-bold text-navy">{tag}</span>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand">
                <ShieldCheck size={15} strokeWidth={2} /> Authorized
              </span>
            </div>

            <div className="mt-4 flex h-[136px] items-center justify-center overflow-hidden rounded-md border border-[#c9daf2] bg-white px-3">
              {logo}
            </div>

            <h3 className="mt-5 flex items-center gap-2 font-serif text-[23px] font-bold leading-tight tracking-[-0.02em] text-ink">
              {title} <BadgeCheck size={20} className="shrink-0 text-brand" aria-label="Verified" />
            </h3>
            <p className="mt-1.5 text-[14.5px] font-bold text-navy">{subtitle}</p>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.55] text-ink">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
