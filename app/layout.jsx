import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/site";

// Konkani (Devanagari script) text, e.g. the Konkani name of the school.
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-deva",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL), // makes every relative address below a full https://www.gsos-ac.in/... address
  title: "Goa State Open School | गोंय राज्य मुक्त शाळा",
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  publisher: SITE_NAME,
  category: "education",
  alternates: { canonical: "./" }, // each page names itself as its own preferred address
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: "Goa State Open School | गोंय राज्य मुक्त शाळा",
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Goa State Open School" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goa State Open School",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Search Console / Bing ownership tags are added only when the codes are set in .env
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#082a63",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${devanagari.variable}`}>
      <body>{children}</body>
    </html>
  );
}
