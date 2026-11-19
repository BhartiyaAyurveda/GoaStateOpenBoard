import { PROGRAMME_LIST } from "@/lib/programmes";
import { SITE_URL } from "@/lib/site";

// sitemap.xml: every public page. The logins, dashboards, maintenance page and API are left out on purpose
// (they are also blocked in robots.txt). The programme pages come from lib/programmes.js, so a new programme is
// listed automatically. The readable list for visitors is the /sitemap page.
export const revalidate = 3600;

const url = (path) => `${SITE_URL}${path}`;

export default function sitemap() {
  const pages = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/courses", changeFrequency: "monthly", priority: 0.9 },
    ...PROGRAMME_LIST.map((p) => ({ path: `/programmes/${p.slug}`, changeFrequency: "monthly", priority: 0.9 })),
    { path: "/study-centres", changeFrequency: "monthly", priority: 0.8 },
    { path: "/notices", changeFrequency: "daily", priority: 0.9 },
    { path: "/result", changeFrequency: "weekly", priority: 0.8 },
    { path: "/admit-card", changeFrequency: "weekly", priority: 0.8 },
    { path: "/enrollment-card", changeFrequency: "weekly", priority: 0.7 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
    { path: "/sitemap", changeFrequency: "monthly", priority: 0.3 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms-of-use", changeFrequency: "yearly", priority: 0.2 },
    { path: "/disclaimer", changeFrequency: "yearly", priority: 0.2 },
  ];

  const downloads = [
    "/forms/Admission-Form-Class-X.pdf",
    "/forms/Admission-Form-Class-XII.pdf",
    "/forms/Affiliation-Form.pdf",
  ].map((path) => ({ path, changeFrequency: "yearly", priority: 0.5 }));

  return [...pages, ...downloads].map(({ path, changeFrequency, priority }) => ({
    url: url(path),
    changeFrequency,
    priority,
  }));
}
