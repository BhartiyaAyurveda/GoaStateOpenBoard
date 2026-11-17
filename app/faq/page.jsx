import { getContactInfo } from "@/lib/site-settings";
import Link from "next/link";
import { CircleHelp, Headphones, IdCard, FileText, ChartColumn, ArrowRight } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqList from "@/components/FaqList";

export const revalidate = 60; // contact details (header menu, footer, help boxes) come from the dashboard

export const metadata = {
  title: "FAQs | Goa State Open School",
  description: "Frequently asked questions about admission, examination, study material, results and certificates at Goa State Open School.",
};

const quick = [
  { text: "Check Result", href: "/result", icon: ChartColumn },
  { text: "Download Admit Card", href: "/admit-card", icon: IdCard },
  { text: "Admission Form Class X", href: "/forms/Admission-Form-Class-X.pdf", icon: FileText, pdf: true },
  { text: "Admission Form Class XII", href: "/forms/Admission-Form-Class-XII.pdf", icon: FileText, pdf: true },
];

export default async function FaqPage() {
  const contact = await getContactInfo();
  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:py-14">
          <section className="card-shadow overflow-hidden rounded-lg bg-white">
            <div className="flex h-[56px] items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5">
              <CircleHelp size={24} strokeWidth={1.8} className="text-navy" />
              <h2 className="text-[21px] font-bold leading-none tracking-tight text-ink">Frequently Asked Questions</h2>
            </div>
            <FaqList />
          </section>

          <div className="flex flex-col gap-6">
            <section className="card-shadow overflow-hidden rounded-lg bg-white">
              <div className="flex h-[56px] items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5">
                <ArrowRight size={22} strokeWidth={1.8} className="text-navy" />
                <h2 className="text-[21px] font-bold leading-none tracking-tight text-ink">Quick Help</h2>
              </div>
              <ul className="px-5 py-1">
                {quick.map(({ text, href, icon: Icon, pdf }) => (
                  <li key={text} className="group border-b border-dashed border-[#9db7e0] last:border-0">
                    <Link
                      href={href}
                      {...(pdf ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex min-h-[56px] items-center gap-3 py-2 text-ink group-hover:text-brand"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-navy">
                        <Icon size={19} strokeWidth={1.6} />
                      </span>
                      <span className="flex-1 text-[14.5px] font-semibold">{text}</span>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-navy text-white transition group-hover:bg-brand">
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <div className="card-shadow flex items-center gap-4 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] p-5 text-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <Headphones size={22} strokeWidth={1.7} />
              </span>
              <div className="text-[14px] font-medium leading-snug">
                <p className="text-[13px] font-bold uppercase tracking-wider text-sky">Still have a question?</p>
                <p className="text-white/90">Call Goa State Open School on</p>
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
