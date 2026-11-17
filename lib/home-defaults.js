// Default homepage content. The Board dashboard > Home Customization tab can override each
// section; anything that has not been customised falls back to these values.
// (Client-safe: plain data only. Icons are referenced by name, see lib/home-icons.js.)

export const HOME_SECTIONS = ["hero", "cards", "quickLinks", "services", "stats", "syllabus"];

export const HOME_DEFAULTS = {
  hero: {
    heading: "Flexible Learning for All Learners",
    text: "An opportunity to complete your Secondary (Class X) and Senior Secondary (Class XII) education through Open Schooling.",
    primary: { label: "Apply for Admission", href: "#" },
    secondary: { label: "Know More", href: "/about" },
    // banner photo: desktop / tablet, and the phone version
    image: "/images/hero.webp",
    imageMobile: "/images/hero-mobile.webp",
    imageAlt: "Goa church, lighthouse and coconut palms",
  },

  // the three cards under the hero
  cards: [
    { title: "Enrollment Card", sub: "Download your Enrollment Card", icon: "FileText", href: "/enrollment-card" },
    { title: "Admit Card", sub: "Download Hall Ticket Examination", icon: "IdCard", href: "/admit-card" },
    { title: "Result", sub: "Check Examination Result Online", icon: "ChartColumn", href: "/result" },
  ],

  // the "Quick Links" panel next to the notices
  quickLinks: {
    items: [
      { text: "Admission Form Class X", href: "/forms/Admission-Form-Class-X.pdf" },
      { text: "Admission Form Class XII", href: "/forms/Admission-Form-Class-XII.pdf" },
      { text: "Affiliation Form", href: "/forms/Affiliation-Form.pdf" },
    ],
    note: "Forms open as PDF. Print, fill in block letters and submit as per the instructions in the Prospectus.",
  },

  // "Our Services" tiles
  services: [
    { label: "Latest Notices", icon: "Megaphone", href: "/notices" },
    { label: "Academic Schedule", icon: "CalendarDays", href: "#" },
    { label: "Study Material", icon: "BookOpen", href: "#" },
    { label: "Previous Year Papers", icon: "Layers", href: "#" },
    { label: "Syllabus", icon: "BookOpen", href: "/downloads/Syllabus-2026-27.pdf" },
    { label: "FAQs", icon: "CircleHelp", href: "/faq" },
  ],

  // the syllabus PDF (Programme pages, footer, sitemap and the homepage "Syllabus" tile)
  syllabus: { title: "Syllabus 2026–27", url: "/downloads/Syllabus-2026-27.pdf" },

  // the numbers bar
  stats: [
    { value: "1,25,000+", label: "Learners Enrolled", icon: "Users" },
    { value: "450+", label: "Study Centres", icon: "Building2" },
    { value: "98%", label: "Pass Percentage", icon: "GraduationCap" },
    { value: "25+", label: "Years of Service", icon: "CalendarDays" },
  ],
};

// size limits (enforced by the server)
export const HOME_LIMITS = { cards: 6, quickLinks: 12, services: 12, stats: 8 };

// external / file links open in a new tab
export const homeLinkProps = (href) =>
  /^https:\/\//i.test(href || "") || /\.pdf($|\?)/i.test(href || "") ? { target: "_blank", rel: "noopener noreferrer" } : {};

// Props for <Image fill>: files in /public are optimised by Next; uploaded (ImageKit https) photos are
// resized and converted to a modern format by ImageKit itself.
export const homeImageProps = (url, width = 1920) =>
  /^https:\/\//i.test(url || "")
    ? { src: `${url}${url.includes("?") ? "&" : "?"}tr=w-${width},q-80,f-webp`, unoptimized: true }
    : { src: url };
