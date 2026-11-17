import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

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
  title: "Goa State Open School | Directorate of Education, Government of Goa",
  description:
    "Goa State Open School – open schooling, flexible learning and second chance education for Secondary (Class X) and Senior Secondary (Class XII).",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${devanagari.variable}`}>
      <body>{children}</body>
    </html>
  );
}
