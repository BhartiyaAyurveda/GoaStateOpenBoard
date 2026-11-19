// Public facts about the website, used by the SEO files (metadata, sitemap.xml, robots.txt, structured data).
// The address is not a secret. Set NEXT_PUBLIC_SITE_URL in .env if the main address ever changes
// (for example to https://gsos-ac.in without the www).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.gsos-ac.in").replace(/\/+$/, "");

export const SITE_NAME = "Goa State Open School";
export const SITE_NAME_KONKANI = "गोंय राज्य मुक्त शाळा";

export const SITE_DESCRIPTION =
  "Goa State Open School is an autonomous body for open schooling, flexible learning and second chance education in Goa: Secondary (Class X) and Senior Secondary (Class XII). Admission, admit card, enrollment card and results online.";

export const SITE_KEYWORDS = [
  "Goa State Open School",
  "GSOS",
  "Goa open school",
  "open schooling Goa",
  "Class 10 open school Goa",
  "Class 12 open school Goa",
  "Secondary Programme Class X",
  "Senior Secondary Programme Class XII",
  "open school admission Goa",
  "admit card",
  "enrollment card",
  "result",
  "study centres Goa",
  "second chance education",
  "गोंय राज्य मुक्त शाळा",
];

// Social preview picture (1200 x 630), kept in /public/images
export const OG_IMAGE = "/images/og-image.png";
