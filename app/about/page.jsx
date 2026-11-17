import Image from "next/image";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  ChartColumn,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Eye,
  FilePen,
  FileText,
  GraduationCap,
  Handshake,
  House,
  IdCard,
  IndianRupee,
  Landmark,
  Laptop,
  MapPin,
  Mountain,
  RotateCcw,
  Scale,
  Target,
  Users,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Stats from "@/components/Stats";

export const revalidate = 60; // homepage content (stats) comes from the dashboard

export const metadata = {
  title: "About Us | Goa State Open School",
  description:
    "About Goa State Open School – an autonomous body for open schooling: overview, mission, vision, values and examination scheme.",
};

// NOTE: the sections below (benefits, who can join, aims, learner journey) are
// general open-schooling content written as placeholders. Verify and replace
// them with Goa State Open School's official text before publishing.
const benefits = [
  { icon: Clock, title: "Flexible Learning", text: "No fixed classroom timetable. Study when it suits you, around work and family." },
  { icon: RotateCcw, title: "Your Own Pace", text: "Move through each subject at a speed you are comfortable with." },
  { icon: MapPin, title: "Study Centre Support", text: "Personal contact classes and guidance at accredited centres close to you." },
  { icon: BadgeCheck, title: "Recognised Certificate", text: "A certificate issued by Goa State Open School on successful completion." },
  { icon: IndianRupee, title: "Affordable Education", text: "A low-cost route to complete Class X or Class XII." },
  { icon: Laptop, title: "Online Services", text: "Download your Enrollment Card and Admit Card and check results online." },
];

const whoCanJoin = [
  { icon: Briefcase, label: "Working youth" },
  { icon: House, label: "Homemakers" },
  { icon: Mountain, label: "Learners in remote areas" },
  { icon: GraduationCap, label: "Those who left school early" },
  { icon: Accessibility, label: "Persons with disabilities" },
  { icon: Users, label: "Adults wanting a second chance" },
];

const aims = [
  "To provide secondary and senior secondary education to learners who are unable to attend regular school.",
  "To offer flexible study, with freedom of place, time and pace of learning.",
  "To prepare quality self-learning study material and learner support through accredited study centres.",
  "To conduct fair and timely public examinations and issue certificates on completion.",
  "To promote inclusion by reaching working learners, homemakers, rural learners and persons with disabilities.",
  "To maintain standards of learning while keeping the flexibility of the open-school system.",
];

const journey = [
  { icon: FilePen, title: "Apply", text: "Download the admission form, fill it in and submit it at your Study Centre with the documents and fee.", href: "/programmes/class-x", cta: "Programme details" },
  { icon: IdCard, title: "Enrollment Card", text: "Collect your Enrollment Number and download your Enrollment Card online.", href: "/enrollment-card", cta: "Get card" },
  { icon: BookOpen, title: "Study", text: "Learn from study material and attend contact classes at your Study Centre.", href: "/downloads/Syllabus-2026-27.pdf", cta: "Syllabus", pdf: true },
  { icon: FileText, title: "Admit Card", text: "Download your Admit Card before the public examination.", href: "/admit-card", cta: "Get admit card" },
  { icon: ClipboardCheck, title: "Examination", text: "Appear for the public examination, held twice a year." },
  { icon: ChartColumn, title: "Result", text: "Check your result online and receive your certificate.", href: "/result", cta: "Check result" },
];

const values = [
  { icon: Handshake, title: "Respect", text: "Every learner is valued, whatever their age, background or circumstance." },
  { icon: Scale, title: "Tolerance", text: "A learning environment that welcomes diverse views, languages and cultures." },
  { icon: Users, title: "Inclusion", text: "Education that reaches working learners, homemakers, rural learners and persons with disabilities." },
  { icon: Award, title: "Excellence", text: "A commitment to quality study material, teaching support and fair examinations." },
];

// NOTE: the scheme figures and examination rules below are adapted from the
// general open-schooling scheme published by another State Open School
// (jsos-ac.in). They are placeholders – verify every number and rule against
// Goa State Open School's own regulations before publishing.
const scheme = [
  { value: "6", label: "Subjects", sub: "for Secondary (Class X)", icon: BookOpen },
  { value: "5", label: "Subjects", sub: "for Senior Secondary (Class XII)", icon: BookOpen },
  { value: "100 hrs", label: "Study per subject", sub: "40 at study centre + 60 self-study", icon: Clock },
  { value: "2 / year", label: "Public examinations", sub: "held twice in a year", icon: ClipboardCheck },
];

const examPoints = [
  "Public examinations are conducted twice a year, as per the schedule notified on this website and through official notices.",
  "A learner gets up to nine attempts within five years from the date of registration to complete the Secondary or Senior Secondary programme.",
  "A learner may appear in one or more subjects in any examination and accumulate credits until all required subjects are passed within the five-year period.",
  "One additional subject may be taken by the learner for convenience, over and above the required subjects.",
  "Credit transfer: a learner who has passed certain subjects from another recognised board may be allowed to transfer credits for up to two subjects.",
  "Study material and personal contact sessions are provided through accredited study centres, and Tutor Marked Assignments (TMA) are submitted as per the guidelines for each session.",
  "Certificates are issued by Goa State Open School on successful completion of the programme.",
  "Eligibility, subject combinations and other rules are given in the admission prospectus and latest notices.",
];

// NOTE: adapted from the general scheme of another State Open School –
// verify against Goa State Open School's actual structure (talukas / study centres)
// before publishing.
const centrePoints = [
  "Study centres are set up across the State so that learners can attend personal contact classes close to where they live.",
  "At least one institution in each taluka may be nominated as an Academic Centre / Study Centre, and there is no restriction on opening more centres where there is demand.",
  "Study centres and vocational study centres are approved through appropriate agreements with the institutions concerned, to implement the open and distance learning programmes.",
  "The list of accredited study centres for each session is published in the Latest Notices section of this website.",
];

function Panel({ icon: Icon, title, className = "", children }) {
  return (
    <section className={`card-shadow flex flex-col overflow-hidden rounded-lg bg-white ${className}`}>
      <div className="flex h-[66px] items-center gap-2.5 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-6">
        <Icon size={26} strokeWidth={1.8} className="text-navy" />
        <h2 className="text-[23px] font-bold leading-none tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content">
        <div className="mx-auto max-w-[1320px] space-y-10 px-4 py-12 sm:px-6 lg:space-y-14 lg:py-16">
          {/* Overview */}
          <Panel icon={Landmark} title="Overview">
            <div className="grid grid-cols-1 gap-8 p-6 sm:p-9 lg:min-h-[420px] lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-10 lg:p-10">
              <div className="space-y-5 text-[16.5px] font-medium leading-[1.8] text-ink">
                <p className="inline-flex items-center gap-2.5 rounded-md bg-navy px-5 py-2.5 text-[18px] font-extrabold uppercase tracking-[0.16em] text-white shadow-md sm:text-[20px]">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky" aria-hidden="true" /> An Autonomous Body
                </p>
                <p>
                  Goa State Open School (GSOS) is <strong className="font-extrabold text-navy underline decoration-brand decoration-2 underline-offset-4">an autonomous body</strong> set up to provide education up to the Secondary (Class X) and Senior Secondary
                  (Class XII) level to learners in Goa who cannot attend a regular school. There is a need to reach
                  learners who are socially, educationally, economically or geographically disadvantaged: those who left
                  school early, working youth, homemakers, learners in remote talukas, the girl child and persons with
                  disabilities. To accelerate the pace and progress of secondary education across the State, GSOS offers
                  flexible open schooling that brings education to the learner&apos;s doorstep.
                </p>
                <p>
                  A detailed scheme of syllabus along with the scheme of examination for the Secondary and Senior
                  Secondary programmes is given in the admission prospectus. For the purpose of certification, a learner
                  studies 6 subjects for Secondary and 5 subjects for Senior Secondary, and may study one more subject as
                  per his or her convenience. The curriculum in each subject is planned for 100 hours of study time: 40
                  hours at the Study Centre in personal contact classes and 60 hours as self-study.
                </p>
                <p>
                  GSOS conducts public examinations twice a year. A learner gets nine chances to appear in the public
                  examinations over a period of five years from the date of registration to complete the Secondary or
                  Senior Secondary course, and GSOS issues pass certificates under its emblem to all who qualify. A
                  learner can choose to appear in any one or more subjects in any examination and earn credits, which are
                  accumulated until all subjects required for certification are completed within five years of
                  registration. Learners who have already passed certain subjects in another recognised Board or Council
                  can get their credits transferred for up to a maximum of two subjects.
                </p>
                <p>
                  Learning support is given through Study Centres across Goa. At least one institution in each taluka is
                  nominated as a Study Centre, and there is no restriction on opening more centres where there is demand.
                  Study Centres and vocational study centres are approved through appropriate agreements to implement the
                  open and distance learning programmes.{" "}
                  <Link href="/study-centres" className="font-bold text-brand underline underline-offset-2 hover:text-navy">
                    Find a Study Centre
                  </Link>
                  .
                </p>
                <p>
                  GSOS is a self-sustained body without any financial commitment on the part of the State Government.
                </p>
              </div>
              <div className="self-start overflow-hidden rounded-lg bg-[#dbe9f9] shadow-md ring-1 ring-black/5">
                <Image
                  src="/images/about-main.webp"
                  alt="Goa State Open School: recognised open schooling for Secondary (Class X) and Senior Secondary (Class XII), for working youth, homemakers, learners in remote areas and persons with disabilities. Study at your own pace with study material and contact sessions, public examinations and a recognised certificate."
                  width={1672}
                  height={941}
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </Panel>

          {/* Mission + Vision */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Panel icon={Target} title="Mission">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#dbe9f9]">
                <Image
                  src="/images/about-mission.webp"
                  alt="A graduation cap, books, a target and a glowing path of learning steps leading to a graduate, set against the Goa coast and a whitewashed church"
                  fill
                  sizes="(min-width: 768px) 630px, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="flex-1 p-6 text-[16px] font-medium leading-[1.8] text-ink sm:p-9">
                To make quality secondary and senior secondary education accessible, flexible and affordable for every
                learner in Goa, and to help learners build the knowledge, skills and values they need for continued
                learning, employment and responsible citizenship.
              </p>
            </Panel>
            <Panel icon={Eye} title="Vision">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#dbe9f9]">
                <Image
                  src="/images/about-vision.webp"
                  alt="Learners of different ages and backgrounds looking hopefully ahead, with books, a globe and a staircase to success in front of a Goa church"
                  fill
                  sizes="(min-width: 768px) 630px, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="flex-1 p-6 text-[16px] font-medium leading-[1.8] text-ink sm:p-9">
                To build an inclusive learning society in which every learner, irrespective of age, background or
                circumstance, gets a second chance to learn and grows into a confident lifelong learner who values
                knowledge, respect, tolerance, inclusion and excellence.
              </p>
            </Panel>
          </div>

          {/* Why choose */}
          <section>
            <div className="mb-7 flex items-center justify-center gap-3">
              <span className="h-[2px] w-12 bg-brand sm:w-14" />
              <h2 className="text-[26px] font-bold leading-none tracking-tight text-ink sm:text-[30px]">Why Goa State Open School</h2>
              <span className="h-[2px] w-12 bg-brand sm:w-14" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="card-shadow flex items-start gap-5 rounded-lg bg-white p-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-[#c9daf2] bg-[#eef4fc] text-brand">
                    <Icon size={28} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="text-[18px] font-bold text-ink">{title}</h3>
                    <p className="mt-1.5 text-[14.5px] font-medium leading-relaxed text-[#44557a]">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Who can join + aims */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <Panel icon={Users} title="Who Can Join?">
              <p className="px-6 pt-6 text-[15.5px] font-medium leading-[1.8] text-ink sm:px-9">
                Goa State Open School is for every learner who wants to complete Class X or Class XII but cannot attend a regular school.
              </p>
              <ul className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 sm:p-9 sm:pt-6">
                {whoCanJoin.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 border border-[#c9daf2] bg-[#f4f8fe] px-4 py-3.5 text-[14.5px] font-semibold text-ink">
                    <Icon size={22} strokeWidth={1.7} className="shrink-0 text-brand" />
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-dashed border-[#9db7e0] bg-[#fff8e6] px-6 py-3.5 text-[14px] font-medium leading-relaxed text-[#5a4300] sm:px-9">
                Eligibility conditions for each class are on the{" "}
                <Link href="/programmes/class-x" className="font-bold underline underline-offset-2">
                  Class X
                </Link>{" "}
                and{" "}
                <Link href="/programmes/class-xii" className="font-bold underline underline-offset-2">
                  Class XII
                </Link>{" "}
                programme pages.
              </p>
            </Panel>

            <Panel icon={Target} title="Aims & Objectives">
              <ol className="divide-y divide-dashed divide-[#9db7e0] px-6 py-2 sm:px-9">
                {aims.map((t, i) => (
                  <li key={t} className="flex items-start gap-4 py-4 text-[15px] font-medium leading-relaxed text-ink">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-navy text-[14px] font-extrabold text-white">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </Panel>
          </div>

          {/* Values */}
          <section>
            <div className="mb-7 flex items-center justify-center gap-3">
              <span className="h-[2px] w-12 bg-brand sm:w-14" />
              <h2 className="text-[26px] font-bold leading-none tracking-tight text-ink sm:text-[30px]">Our Core Values</h2>
              <span className="h-[2px] w-12 bg-brand sm:w-14" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="card-shadow rounded-lg bg-gradient-to-b from-white to-[#e9f1fc] px-6 py-9 text-center"
                >
                  <span className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full border border-[#c9daf2] bg-white text-brand">
                    <Icon size={32} strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-4 text-[20px] font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-[14.5px] font-medium leading-relaxed text-[#44557a]">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Scheme of studies */}
          <section>
            <div className="mb-7 flex items-center justify-center gap-3">
              <span className="h-[2px] w-12 bg-brand sm:w-14" />
              <h2 className="text-[26px] font-bold leading-none tracking-tight text-ink sm:text-[30px]">Scheme of Studies</h2>
              <span className="h-[2px] w-12 bg-brand sm:w-14" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {scheme.map(({ value, label, sub, icon: Icon }) => (
                <div key={sub} className="card-shadow flex min-h-[150px] items-center gap-5 rounded-lg bg-gradient-to-br from-white to-[#e6effb] px-6 py-7">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-[#c9daf2] bg-white text-brand">
                    <Icon size={30} strokeWidth={1.6} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[30px] font-extrabold tracking-tight text-ink">{value}</p>
                    <p className="text-[14.5px] font-bold text-ink">{label}</p>
                    <p className="mt-1 text-[13.5px] font-medium text-[#5b6b8c]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Examination & certification */}
          <Panel icon={ClipboardCheck} title="Examination & Certification">
            <ul className="divide-y divide-dashed divide-[#9db7e0] px-6 py-2 sm:px-9">
              {examPoints.map((p) => (
                <li key={p} className="flex items-start gap-4 py-5 text-[15.5px] font-medium leading-relaxed text-ink">
                  <CheckCircle2 size={22} strokeWidth={1.8} className="mt-px shrink-0 text-[#16a34a]" />
                  {p}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel icon={Building2} title="Study Centres">
            <ul className="divide-y divide-dashed divide-[#9db7e0] px-6 py-2 sm:px-9">
              {centrePoints.map((p) => (
                <li key={p} className="flex items-start gap-4 py-5 text-[15.5px] font-medium leading-relaxed text-ink">
                  <CheckCircle2 size={22} strokeWidth={1.8} className="mt-px shrink-0 text-[#16a34a]" />
                  {p}
                </li>
              ))}
            </ul>
          </Panel>

          {/* Learner journey */}
          <section>
            <div className="mb-7 flex items-center justify-center gap-3">
              <span className="h-[2px] w-12 bg-brand sm:w-14" />
              <h2 className="text-[26px] font-bold leading-none tracking-tight text-ink sm:text-[30px]">Your Learning Journey</h2>
              <span className="h-[2px] w-12 bg-brand sm:w-14" />
            </div>
            <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {journey.map(({ icon: Icon, title, text, href, cta, pdf }, i) => (
                <li key={title} className="card-shadow relative flex flex-col rounded-lg border-t-4 border-navy bg-white p-6">
                  <span className="absolute right-4 top-3 text-[34px] font-extrabold leading-none text-[#dbe6f6]" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-navy text-white">
                    <Icon size={24} strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-4 text-[19px] font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 flex-1 text-[14.5px] font-medium leading-relaxed text-[#44557a]">{text}</p>
                  {href && (
                    <Link
                      href={href}
                      {...(pdf ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="mt-4 inline-flex items-center gap-1.5 self-start text-[14px] font-bold text-brand hover:text-navy"
                    >
                      {cta} <ArrowRight size={14} strokeWidth={2.5} />
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <Stats tall />

          {/* Call to action */}
          <section className="card-shadow flex flex-col items-start justify-between gap-5 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] px-6 py-9 text-white sm:px-10 sm:py-12 md:flex-row md:items-center">
            <div>
              <h2 className="text-[26px] font-bold leading-tight sm:text-[32px]">Ready to continue your education?</h2>
              <p className="mt-2 text-[15.5px] font-medium text-white/85">
                Apply for admission to Class X or Class XII, or reach out to us for any help.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#"
                className="inline-flex h-[44px] items-center gap-2 rounded-md bg-white px-6 text-[14.5px] font-bold text-navy-deep hover:bg-sky-50"
              >
                Apply for Admission <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-[44px] items-center gap-2 rounded-md border border-white/60 px-6 text-[14.5px] font-bold text-white hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
