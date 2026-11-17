import { getContactInfo } from "@/lib/site-settings";
import Link from "next/link";
import { CheckCircle2, FileText, Headphones, ListChecks } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SamplePdfCard from "@/components/SamplePdfCard";
import EnrollmentCardLookup from "@/components/EnrollmentCardLookup";

export const revalidate = 60; // contact details (header menu, footer, help boxes) come from the dashboard

export const metadata = {
  title: "Enrollment Card | Goa State Open School",
  description: "Download your Goa State Open School Enrollment Card using your enrollment number and date of birth.",
};

const instructions = [
  "Enter the Enrollment Number you received when your Study Centre submitted your admission.",
  "Enter your Date of Birth as given in your admission form.",
  "Click \"Get Enrollment Card\", then print it or save it as PDF.",
  "Note your Enrollment Number. You need it to download your Admit Card and check your Result.",
];

function Panel({ icon: Icon, title, children }) {
  return (
    <section className="card-shadow flex flex-col overflow-hidden rounded-lg bg-white">
      <div className="flex h-[56px] items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5 print:hidden">
        <Icon size={24} strokeWidth={1.8} className="text-navy" />
        <h2 className="text-[21px] font-bold leading-none tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default async function EnrollmentCardPage() {
  const contact = await getContactInfo();
  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.45fr_1fr] lg:items-start lg:py-14">
          <Panel icon={FileText} title="Download Enrollment Card">
            <EnrollmentCardLookup />
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

            <SamplePdfCard title="enrollment card" file="Sample-Enrollment-Card.pdf" />

            <div className="card-shadow flex items-center gap-4 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] p-5 text-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <Headphones size={22} strokeWidth={1.7} />
              </span>
              <div className="text-[14px] font-medium leading-snug">
                <p className="text-[13px] font-bold uppercase tracking-wider text-sky">Any queries?</p>
                <p className="text-white/90">Call your Study Centre or Goa State Open School on</p>
                <a href={contact.tel} className="text-[22px] font-extrabold leading-tight hover:text-sky">
                  {contact.phone}
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
