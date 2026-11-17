import Link from "next/link";
import { ChevronRight } from "lucide-react";
import LegalPage from "@/components/LegalPage";
import { getHomeContent } from "@/lib/home-content";

export const revalidate = 60; // contact details (header menu, footer, help boxes) come from the dashboard

export const metadata = {
  title: "Sitemap | Goa State Open School",
  description: "A list of all pages of the Goa State Open School website.",
};

// pdf: opens in a new tab
const BASE_GROUPS = [
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
      { label: "All Courses & Subjects", href: "/courses" },
      { label: "Secondary Programme – Class X", href: "/programmes/class-x" },
      { label: "Senior Secondary Programme – Class XII", href: "/programmes/class-xii" },
      { label: "Study Centres", href: "/study-centres" },
    ],
  },
  {
    title: "Downloads",
    links: [
      { label: "Admission Form – Class X (PDF)", href: "/forms/Admission-Form-Class-X.pdf", pdf: true },
      { label: "Admission Form – Class XII (PDF)", href: "/forms/Admission-Form-Class-XII.pdf", pdf: true },
      { label: "Affiliation Form (PDF)", href: "/forms/Affiliation-Form.pdf", pdf: true },
      { label: "SYLLABUS", href: "#syllabus", pdf: true }, // replaced with the uploaded PDF below
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

export default async function SitemapPage() {
  const { syllabus } = await getHomeContent();
  const groups = BASE_GROUPS.map((g) => ({
    ...g,
    links: g.links.map((l) => (l.label === "SYLLABUS" ? { ...l, label: `${syllabus.title} (PDF)`, href: syllabus.url } : l)),
  }));
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
