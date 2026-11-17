import { getContactInfo } from "@/lib/site-settings";
import Link from "next/link";
import { CheckCircle2, Headphones, Landmark, ShieldAlert, UserRound } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";

const ROLES = {
  board: {
    icon: UserRound,
    title: "Board Login",
    heading: "Board Officials",
    lead: "Secure sign-in for officials of Goa State Open School.",
    idLabel: "User ID",
    idPlaceholder: "Enter your User ID",
    points: ["Manage admissions and enrollments", "Examination, results and admit card management", "Notices, circulars and study centre approvals"],
  },
  college: {
    icon: Landmark,
    title: "College Login",
    heading: "Study Centres / Colleges",
    lead: "Sign-in for Study Centre coordinators and affiliated institutions.",
    idLabel: "Study Centre Code / User ID",
    idPlaceholder: "Enter your Study Centre Code",
    points: ["Submit and track student admissions", "Download enrollment lists and admit cards", "View results of your enrolled learners"],
  },
};

export default async function LoginShell({ role }) {
  const contact = await getContactInfo();
  const r = ROLES[role];
  const Icon = r.icon;

  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content" className="bg-[#f1f6fd]">
        <div className="mx-auto max-w-[1100px] px-3 py-6 sm:px-6 sm:py-10 lg:py-16">
          <div className="card-shadow grid grid-cols-1 overflow-hidden rounded-lg bg-white lg:grid-cols-[1fr_1.05fr]">
            {/* info panel */}
            <section className="relative isolate order-2 min-w-0 overflow-hidden lg:order-1 bg-gradient-to-br from-navy-deep via-navy to-[#164a9e] p-5 text-white sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30 sm:h-16 sm:w-16">
                <Icon strokeWidth={1.6} className="size-6 sm:size-[30px]" />
              </span>
              <p className="mt-4 text-[12.5px] font-bold uppercase tracking-[0.18em] text-sky sm:mt-5 sm:text-[13px] sm:tracking-[0.2em]">Goa State Open School<span lang="kok" className="font-devanagari block normal-case tracking-normal text-[14.5px] font-semibold text-white/90">गोंय राज्य मुक्त शाळा</span></p>
              <h1 className="mt-1 text-[24px] font-extrabold leading-tight tracking-tight sm:text-[34px]">{r.heading}</h1>
              <p className="mt-2 max-w-[420px] text-[14px] font-medium leading-relaxed text-white/85 sm:mt-3 sm:text-[15px]">{r.lead}</p>

              <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[14px] font-medium leading-snug text-white/90 sm:text-[14.5px]">
                    <CheckCircle2 size={19} strokeWidth={1.8} className="mt-px shrink-0 text-sky" />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-3 border-t border-white/20 pt-4 text-[14px] font-medium text-white/85 sm:mt-8 sm:pt-5">
                <Headphones size={18} className="shrink-0 text-sky" />
                <p>
                  Need help? Call{" "}
                  <a href={contact.tel} className="font-bold text-white hover:text-sky">
                    {contact.phone}
                  </a>{" "}
                  or{" "}
                  <Link href="/contact" className="font-bold underline underline-offset-2 hover:text-sky">
                    write to us
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* form */}
            <section className="order-1 min-w-0 p-5 sm:p-10 lg:order-2">
              <h2 className="text-[22px] font-bold tracking-tight text-ink sm:text-[24px]">{r.title}</h2>
              <p className="mb-5 mt-1 text-[14px] font-medium text-[#44557a] sm:mb-6 sm:text-[14px]">Enter your credentials to continue.</p>
              <LoginForm role={role} idLabel={r.idLabel} idPlaceholder={r.idPlaceholder} />

              <p className="mt-5 flex items-start gap-2 rounded-md sm:mt-6 border border-[#f3d28a] bg-[#fff8e6] px-3.5 py-3 text-[13px] font-medium leading-relaxed text-[#5a4300]">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <span>
                  For authorised users only. Never share your password or OTP with anyone. Activity on this portal may be monitored.
                </span>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
