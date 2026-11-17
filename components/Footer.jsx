import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Phone, Mail } from "lucide-react";
import { getContactInfo } from "@/lib/site-settings";
import SocialLinks from "@/components/SocialLinks";
import { getHomeContent } from "@/lib/home-content";

const quick = ["About Us", "Enrollment Card", "Admit Card", "Result", "Contact Us"];
// pages of this website (a .pdf opens in a new tab)
const importantBase = [
  { label: "Courses", href: "/courses" },
  { label: "Study Centres", href: "/study-centres" },
  { label: "FAQs", href: "/faq" },
  { label: "Notices", href: "/notices" },
  { label: "Class X Programme", href: "/programmes/class-x" },
  { label: "Class XII Programme", href: "/programmes/class-xii" },
];
const legal = [
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Sitemap", href: "/sitemap" },
];

export default async function Footer() {
  const contact = await getContactInfo();
  const { syllabus } = await getHomeContent();
  const important = [...importantBase, { label: "Syllabus", href: syllabus.url }];
  return (
    <footer id="contact" className="print:hidden">
      <div className="bg-navy text-white">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.1fr_0.8fr_1.05fr_1.1fr] lg:gap-0">
          <div className="flex flex-col items-start gap-4 lg:pr-8">
            {/* same logos as the header, on a white plate so they stay legible on the navy footer */}
            <div className="flex items-center gap-3 rounded-md bg-white px-4 py-3 shadow-sm">
              <Image
                src="/images/emblem-top.png"
                alt="Emblem of India"
                width={240}
                height={360}
                className="h-[72px] w-auto mix-blend-multiply"
              />
              <span className="h-[56px] w-px bg-[#c4cde0]" aria-hidden="true" />
              <Image
                src="/images/logo.png"
                alt="Goa State Open School logo"
                width={480}
                height={266}
                className="h-[52px] w-auto"
              />
            </div>
            <div className="leading-snug">
              <p className="text-[20px] font-bold tracking-wide">GOA STATE OPEN SCHOOL</p>
              <p lang="kok" className="font-devanagari text-[15px] font-semibold">गोंय राज्य मुक्त शाळा</p>
              <p className="mt-1 text-[14px] font-medium">Directorate of Education</p>
              <p className="text-[14px] font-medium">Government of Goa</p>
            </div>
          </div>

          <div className="lg:border-l lg:border-white/30 lg:pl-8">
            <h4 className="text-[15px] font-bold">Quick Links</h4>
            <ul className="mt-4 space-y-3 text-[14px] font-medium">
              {quick.map((l) => (
                <li key={l}>
                  <Link href={l === "Contact Us" ? "/contact" : l === "About Us" ? "/about" : l === "Result" ? "/result" : l === "Admit Card" ? "/admit-card" : l === "Enrollment Card" ? "/enrollment-card" : "#"} className="flex items-center gap-1.5 hover:text-sky">
                    <ChevronRight size={11} strokeWidth={2.5} /> {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-white/30 lg:pl-8">
            <h4 className="text-[15px] font-bold">Important Links</h4>
            <ul className="mt-4 space-y-3 text-[14px] font-medium">
              {important.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    {...(href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-1.5 hover:text-sky"
                  >
                    <ChevronRight size={11} strokeWidth={2.5} /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-white/30 lg:pl-8">
            <h4 className="text-[15px] font-bold">Contact Information</h4>
            <ul className="mt-4 space-y-4 text-[14px] font-medium">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
                  <MapPin size={17} strokeWidth={1.9} />
                </span>
                <span className="pt-0.5 leading-snug">
                  {contact.addressLines.map((l, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {l}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
                  <Phone size={17} strokeWidth={1.9} />
                </span>
                <a href={contact.tel} className="hover:text-sky">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
                  <Mail size={17} strokeWidth={1.9} />
                </span>
                <a href={`mailto:${contact.email}`} className="break-all hover:text-sky">
                  {contact.email}
                </a>
              </li>
            </ul>
            <SocialLinks className="mt-6" />
          </div>
        </div>
      </div>

      <div className="bg-[#e8eef8] text-[13px] font-medium text-ink">
        <div className="mx-auto flex min-h-[72px] max-w-[1320px] flex-col items-center justify-between gap-2 px-4 py-3 sm:px-6 md:flex-row">
          <p className="text-center">© 2020 Goa State Open School. All Rights Reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            {legal.map(({ label, href }, i) => (
              <li key={label} className={i > 0 ? "sm:border-l sm:border-ink/50 sm:pl-5" : ""}>
                <Link href={href} className="hover:text-brand">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
