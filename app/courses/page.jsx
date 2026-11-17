import Link from "next/link";
import { ArrowRight, BookOpen, Clock, FileText, GraduationCap, Headphones, Layers, ListChecks } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getContactInfo } from "@/lib/site-settings";
import { getCourses, prettyCategory } from "@/lib/courses-server";

export const revalidate = 60; // courses come from the Board dashboard

export const metadata = {
  title: "Courses | Goa State Open School",
  description: "Programmes, eligibility and subjects offered by Goa State Open School – Secondary (Class X) and Senior Secondary (Class XII).",
};

const iconFor = (category) => (category === "secondary" ? GraduationCap : category === "senior_secondary" ? BookOpen : Layers);

export default async function CoursesPage() {
  const [courses, contact] = await Promise.all([getCourses(), getContactInfo()]);

  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content">
        <section className="bg-gradient-to-b from-[#dfeafa] to-white">
          <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:py-14">
            <p className="text-[13.5px] font-bold uppercase tracking-[0.2em] text-brand">Goa State Open School <span lang="kok" className="font-devanagari normal-case tracking-normal"> · गोंय राज्य मुक्त शाळा</span></p>
            <h1 className="mt-2 font-serif text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[42px]">Our Courses</h1>
            <div className="mt-3 flex items-center gap-2" aria-hidden="true">
              <span className="h-[3px] w-14 bg-brand" />
              <span className="h-[3px] w-3 bg-navy/60" />
            </div>
            <p className="mt-4 max-w-[760px] text-[15.5px] font-medium leading-[1.7] text-ink/90">
              Study at your own pace through open schooling. Choose a programme below to see who can join, how long it takes and which subjects it covers.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1320px] px-4 pb-12 sm:px-6 lg:pb-16">
          {courses.length === 0 ? (
            <div className="card-shadow rounded-lg bg-white px-6 py-16 text-center">
              <GraduationCap size={44} strokeWidth={1.4} className="mx-auto text-[#9db7e0]" />
              <p className="mt-4 text-[18px] font-bold text-ink">Course details will be published soon.</p>
              <p className="mt-1 text-[14.5px] text-[#44557a]">
                Meanwhile see the <Link href="/programmes/class-x" className="font-bold text-brand hover:underline">Class X</Link> and{" "}
                <Link href="/programmes/class-xii" className="font-bold text-brand hover:underline">Class XII</Link> programmes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {courses.map((c) => {
                const Icon = iconFor(c.category);
                return (
                  <article key={c.id} id={`course-${c.id}`} className="card-shadow flex scroll-mt-[80px] flex-col overflow-hidden rounded-lg bg-white">
                    <header className="flex items-start gap-4 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5 py-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-white text-navy">
                        <Icon size={30} strokeWidth={1.5} />
                      </span>
                      <div className="min-w-0">
                        {c.category && <p className="text-[12.5px] font-bold uppercase tracking-wider text-brand">{prettyCategory(c.category)}</p>}
                        <h2 className="font-serif text-[22px] font-bold leading-tight tracking-tight text-ink">{c.name}</h2>
                        {c.local && <p className="mt-0.5 font-devanagari text-[15px] font-semibold text-[#44557a]">{c.local}</p>}
                      </div>
                    </header>

                    <div className="flex flex-1 flex-col gap-5 px-5 py-5">
                      <div className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
                        {c.duration && (
                          <span className="inline-flex items-center gap-1.5 rounded border border-[#c9daf2] bg-[#f4f8fe] px-3 py-1 text-[#44557a]"><Clock size={14} /> {c.duration}</span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded border border-[#c9daf2] bg-[#f4f8fe] px-3 py-1 text-[#44557a]">
                          <BookOpen size={14} /> {c.subjects.length ? `${c.subjects.length} subjects` : "Subjects to be announced"}
                        </span>
                      </div>

                      {c.about && <p className="text-[14.5px] font-medium leading-[1.65] text-ink">{c.about}</p>}

                      {c.eligibility && (
                        <div className="rounded border border-[#c9daf2] bg-[#eef4fc] px-4 py-3">
                          <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#44557a]"><ListChecks size={15} /> Eligibility</p>
                          <p className="mt-1 text-[14.5px] font-medium leading-snug text-ink">{c.eligibility}</p>
                        </div>
                      )}

                      {c.subjects.length > 0 && (
                        <div>
                          <p className="text-[13px] font-bold uppercase tracking-wider text-[#44557a]">Subjects</p>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {c.subjects.map((s) => (
                              <li key={s} className="rounded border border-[#c9daf2] bg-white px-2.5 py-1 text-[13.5px] font-semibold text-ink">{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-auto flex flex-wrap gap-3 pt-1">
                        {c.programmeSlug && (
                          <Link href={`/programmes/${c.programmeSlug}`} className="inline-flex h-[42px] items-center gap-2 rounded bg-navy px-5 text-[14px] font-bold text-white hover:bg-brand">
                            Programme details <ArrowRight size={14} strokeWidth={2.5} />
                          </Link>
                        )}
                        {c.formUrl && (
                          <a href={c.formUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-[42px] items-center gap-2 rounded border border-navy bg-white px-5 text-[14px] font-bold text-ink hover:bg-navy hover:text-white">
                            <FileText size={15} /> Admission form
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="card-shadow mt-8 flex flex-col gap-4 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] p-5 text-white sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
              <Headphones size={22} strokeWidth={1.7} />
            </span>
            <div className="text-[14px] font-medium leading-snug">
              <p className="text-[13px] font-bold uppercase tracking-wider text-sky">Need help choosing a programme?</p>
              <p className="text-white/90">
                Call <a href={contact.tel} className="font-extrabold text-white hover:text-sky">{contact.phone}</a> or{" "}
                <Link href="/contact" className="font-bold underline underline-offset-2 hover:text-sky">write to us</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
