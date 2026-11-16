import Link from "next/link";
import { ChevronRight } from "lucide-react";
import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Sitemap | Goa Open School",
  description: "A list of all pages of the Goa Open School website.",
};

// pdf: opens in a new tab
const groups = [
  {
    title: "Main Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Notices", href: "/notices" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Student Services",
    links: [
      { label: "Enrollment Card", href: "/enrollment-card" },
      { label: "Admit Card", href: "/admit-card" },
      { label: "Result", href: "/result" },
    ],
  },
  {
    title: "Programmes",
    links: [
      { label: "Secondary Programme – Class X", href: "/programmes/class-x" },
      { label: "Senior Secondary Programme – Class XII", href: "/programmes/class-xii" },
    ],
  },
  {
    title: "Downloads",
    links: [
      { label: "Admission Form – Class X (PDF)", href: "/forms/Admission-Form-Class-X.pdf", pdf: true },
      { label: "Admission Form – Class XII (PDF)", href: "/forms/Admission-Form-Class-XII.pdf", pdf: true },
      { label: "Affiliation Form (PDF)", href: "/forms/Affiliation-Form.pdf", pdf: true },
      { label: "Syllabus 2026–27 (PDF)", href: "/downloads/Syllabus-2026-27.pdf", pdf: true },
    ],
  },
  {
    title: "Login",
    links: [
      { label: "Board Login", href: "/board-login" },
      { label: "College Login", href: "/college-login" },
    ],
  },
  {
    title: "Website Policies",
    links: [
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms-of-use" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <LegalPage current="sitemap" title="Sitemap" intro="All the pages of this website in one place." showUpdated={false}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="border-b-2 border-navy pb-2 text-[18px] font-bold text-ink">{g.title}</h2>
            <ul className="mt-2">
              {g.links.map(({ label, href, pdf }) => (
                <li key={href} className="border-b border-dashed border-[#c9d6ec]">
                  <Link
                    href={href}
                    {...(pdf ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-2 py-3 text-[14.5px] font-semibold text-ink hover:text-brand"
                  >
                    <ChevronRight size={14} strokeWidth={2.5} className="shrink-0 text-navy" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </LegalPage>
  );
}
