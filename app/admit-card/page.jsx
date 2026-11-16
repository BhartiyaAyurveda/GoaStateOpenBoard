import Link from "next/link";
import { CheckCircle2, Headphones, IdCard, ListChecks } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdmitCardLookup from "@/components/AdmitCardLookup";

export const metadata = {
  title: "Admit Card | Goa Open School",
  description: "Download your Goa Open School examination admit card (hall ticket) using your enrollment number and date of birth.",
};

const instructions = [
  "Enter your Enrollment Number exactly as printed on your Enrollment Card.",
  "Enter your Date of Birth as given in your admission form.",
  "Click \"Get Admit Card\", then print it or save it as PDF.",
  "Carry the printed admit card and a valid photo ID to the examination centre.",
];

function Panel({ icon: Icon, title, className = "", children }) {
  return (
    <section className={`card-shadow flex flex-col overflow-hidden rounded-lg bg-white ${className}`}>
      <div className="flex h-[56px] items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5 print:hidden">
        <Icon size={24} strokeWidth={1.8} className="text-navy" />
        <h2 className="text-[21px] font-bold leading-none tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AdmitCardPage() {
  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.45fr_1fr] lg:items-start lg:py-14">
          <Panel icon={IdCard} title="Download Admit Card">
            <AdmitCardLookup />
          </Panel>

          <div className="flex flex-col gap-6 print:hidden">
            <Panel icon={ListChecks} title="Instructions">
              <ul className="divide-y divide-dashed divide-[#9db7e0] px-5">
                {instructions.map((t) => (
                  <li key={t} className="flex items-start gap-3 py-3 text-[14px] font-medium leading-snug text-ink">
                    <CheckCircle2 size={19} strokeWidth={1.8} className="mt-px shrink-0 text-[#16a34a]" />
                    {t}
                  </li>
                ))}
              </ul>
            </Panel>


            <div className="card-shadow flex items-center gap-4 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] p-5 text-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <Headphones size={22} strokeWidth={1.7} />
              </span>
              <div className="text-[14px] font-medium leading-snug">
                <p className="text-[13px] font-bold uppercase tracking-wider text-sky">Any queries?</p>
                <p className="text-white/90">Call your Study Centre or Goa Open School on</p>
                <a href="tel:+918322743300" className="text-[22px] font-extrabold leading-tight hover:text-sky">
                  0832–2743300
                </a>
                <p className="text-white/80">
                  or{" "}
                  <Link href="/contact" className="font-bold underline underline-offset-2 hover:text-sky">
                    write to us
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
