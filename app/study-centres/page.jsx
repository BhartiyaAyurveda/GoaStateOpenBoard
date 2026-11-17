import Link from "next/link";
import { Building2, Headphones } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudyCentresList from "@/components/StudyCentresList";
import { getContactInfo } from "@/lib/site-settings";
import { getStudyCentres } from "@/lib/study-centres-server";

export const revalidate = 60; // the list comes from the Board dashboard

export const metadata = {
  title: "Study Centres | Goa State Open School",
  description: "Find a Goa State Open School study centre near you: address, phone and contact details.",
};

export default async function StudyCentresPage() {
  const [centres, contact] = await Promise.all([getStudyCentres(), getContactInfo()]);

  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content">
        <section className="bg-gradient-to-b from-[#dfeafa] to-white">
          <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:py-14">
            <p className="text-[13.5px] font-bold uppercase tracking-[0.2em] text-brand">Goa State Open School</p>
            <h1 className="mt-2 font-serif text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[42px]">Study Centres</h1>
            <div className="mt-3 flex items-center gap-2" aria-hidden="true">
              <span className="h-[3px] w-14 bg-brand" />
              <span className="h-[3px] w-3 bg-navy/60" />
            </div>
            <p className="mt-4 max-w-[760px] text-[15.5px] font-medium leading-[1.7] text-ink/90">
              Study centres support learners with admission, classes and examinations. Find the centre nearest to you and contact it directly.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1320px] px-4 pb-12 sm:px-6 lg:pb-16">
          {centres.length === 0 ? (
            <div className="card-shadow rounded-lg bg-white px-6 py-16 text-center">
              <Building2 size={44} strokeWidth={1.4} className="mx-auto text-[#9db7e0]" />
              <p className="mt-4 text-[18px] font-bold text-ink">The list of study centres will be published soon.</p>
              <p className="mt-1 text-[14.5px] text-[#44557a]">
                Meanwhile, call <a href={contact.tel} className="font-bold text-brand hover:underline">{contact.phone}</a> or{" "}
                <Link href="/contact" className="font-bold text-brand hover:underline">write to us</Link>.
              </p>
            </div>
          ) : (
            <StudyCentresList centres={centres} />
          )}

          <div className="card-shadow mt-8 flex flex-col gap-4 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] p-5 text-white sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
              <Headphones size={22} strokeWidth={1.7} />
            </span>
            <div className="text-[14px] font-medium leading-snug">
              <p className="text-[13px] font-bold uppercase tracking-wider text-sky">Cannot find a centre near you?</p>
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
