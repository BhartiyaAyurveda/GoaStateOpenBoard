import { getContactInfo } from "@/lib/site-settings";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  Headphones,
  Info,
  ListChecks,
  UserCheck,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PROGRAMMES, PROGRAMME_LIST } from "@/lib/programmes";
import { getHomeContent } from "@/lib/home-content";

export function generateStaticParams() {
  return PROGRAMME_LIST.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = PROGRAMMES[slug];
  if (!p) return { title: "Programme not found | Goa State Open School" };
  return { title: `${p.title} | Goa State Open School`, description: p.tagline };
}

function Panel({ icon: Icon, title, children }) {
  return (
    <section className="card-shadow overflow-hidden rounded-lg bg-white">
      <div className="flex h-[56px] items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5">
        <Icon size={24} strokeWidth={1.8} className="text-navy" />
        <h2 className="text-[21px] font-bold leading-none tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const tick = <span className="mt-[7px] h-2 w-2 shrink-0 bg-navy" aria-hidden="true" />;

export const revalidate = 60; // contact details (header menu, footer, help boxes) come from the dashboard

export default async function ProgrammePage({ params }) {
  const contact = await getContactInfo();
  const { syllabus } = await getHomeContent();
  const { slug } = await params;
  const p = PROGRAMMES[slug];
  if (!p) notFound();
  const other = PROGRAMME_LIST.find((x) => x.slug !== p.slug);

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
            <span>Programmes</span>
            <ChevronRight size={14} strokeWidth={2.5} />
            <span aria-current="page" className="text-ink">
              {p.short}
            </span>
          </nav>

          {/* heading band */}
          <div className="mt-4 border-l-[6px] border-navy bg-gradient-to-r from-[#e3edfa] to-white px-5 py-5 sm:px-7">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#44557a]">Goa State Open School</p>
            <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[34px]">{p.title}</h1>
            <p className="mt-1.5 max-w-[760px] text-[15px] font-medium leading-relaxed text-[#44557a]">{p.tagline}</p>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:py-10">
          <div className="space-y-6">
            <Panel icon={Info} title="About the Programme">
              <div className="space-y-3 p-5 text-[15px] font-medium leading-[1.7] text-ink sm:p-7">
                {p.overview.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <div className="grid grid-cols-2 border-t border-[#c9daf2] bg-[#f4f8fe] lg:grid-cols-4">
                {p.facts.map((f, i) => (
                  <div key={f.label} className={`px-4 py-4 text-center ${i ? "lg:border-l lg:border-[#c9daf2]" : ""} ${i === 2 ? "border-t border-[#c9daf2] lg:border-t-0" : ""} ${i === 3 ? "border-l border-t border-[#c9daf2] lg:border-t-0" : ""} ${i === 1 ? "border-l border-[#c9daf2]" : ""}`}>
                    <p className="text-[26px] font-extrabold leading-none tracking-tight text-navy">{f.value}</p>
                    <p className="mt-1 text-[14px] font-bold text-ink">{f.label}</p>
                    <p className="mt-0.5 text-[12.5px] font-medium text-[#5b6b8c]">{f.sub}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={UserCheck} title="Eligibility">
              <ul className="space-y-3 p-5 sm:p-7">
                {p.eligibility.map((t) => (
                  <li key={t} className="flex gap-3 text-[14.5px] font-medium leading-relaxed text-ink">
                    {tick}
                    {t}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel icon={BookOpen} title="Subjects Offered">
              <table className="w-full border-collapse text-[14px]">
                <tbody>
                  {p.subjects.map(([group, list]) => (
                    <tr key={group} className="border-b border-dashed border-[#9db7e0] last:border-0">
                      <th className="w-[30%] bg-[#f4f8fe] px-5 py-3.5 text-left align-top font-bold text-ink sm:px-7">{group}</th>
                      <td className="px-5 py-3.5 font-medium text-ink sm:px-7">{list}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-[#c9daf2] bg-[#fff8e6] px-5 py-3 text-[13.5px] font-medium text-[#5a4300] sm:px-7">
                The full subject scheme with codes and marks is given in the{" "}
                <a href={syllabus.url} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2">
                  Syllabus (PDF)
                </a>
                .
              </p>
            </Panel>

            <Panel icon={ListChecks} title="Documents Required">
              <ul className="divide-y divide-dashed divide-[#9db7e0] px-5 sm:px-7">
                {p.documents.map((t) => (
                  <li key={t} className="flex items-start gap-3 py-3 text-[14.5px] font-medium leading-snug text-ink">
                    <ClipboardCheck size={19} strokeWidth={1.8} className="mt-px shrink-0 text-[#16a34a]" />
                    {t}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-6">
            <div className="card-shadow overflow-hidden rounded-lg bg-gradient-to-br from-navy-deep to-[#164a9e] p-6 text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <GraduationCap size={24} strokeWidth={1.7} />
              </span>
              <h2 className="mt-3 text-[20px] font-bold leading-tight">Apply for {p.short}</h2>
              <p className="mt-1 text-[14px] font-medium leading-relaxed text-white/85">
                Download the admission form, fill it in block letters and submit it at your nearest Study Centre.
              </p>
              <a
                href={p.form}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-md bg-white text-[14.5px] font-bold text-navy-deep transition hover:bg-sky-50"
              >
                <Download size={17} /> Admission Form ({p.short})
              </a>
              <a
                href={syllabus.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-md border border-white/60 text-[14.5px] font-bold text-white transition hover:bg-white/10"
              >
                <FileText size={17} /> Download Syllabus
              </a>
            </div>

            <Panel icon={ArrowRight} title="Other Programme">
              <Link
                href={`/programmes/${other.slug}`}
                className="group flex items-center gap-3 px-5 py-4 text-ink hover:text-brand"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-navy">
                  <GraduationCap size={20} strokeWidth={1.6} />
                </span>
                <span className="flex-1 text-[14.5px] font-semibold leading-snug">{other.title}</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-navy text-white transition group-hover:bg-brand">
                  <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              </Link>
            </Panel>

            <div className="card-shadow flex items-center gap-4 rounded-lg bg-[#eef4fc] p-5 text-ink">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                <Headphones size={22} strokeWidth={1.7} />
              </span>
              <div className="text-[14px] font-medium leading-snug">
                <p className="text-[13px] font-bold uppercase tracking-wider text-[#44557a]">Any queries?</p>
                <a href={contact.tel} className="text-[20px] font-extrabold leading-tight text-navy hover:text-brand">
                  {contact.phone}
                </a>
                <p>
                  or{" "}
                  <Link href="/faq" className="font-bold underline underline-offset-2 hover:text-brand">
                    read the FAQs
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
