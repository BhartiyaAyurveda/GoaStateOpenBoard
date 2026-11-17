import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = { title: "Maintenance | Goa State Open School" };
// Read the admin-set message on every request so changes show up immediately.
export const dynamic = "force-dynamic";

const DEFAULT_MESSAGE =
  "We are currently undergoing scheduled maintenance to improve your experience. Please check back shortly. We apologize for the inconvenience.";

async function getMessage() {
  try {
    const { data } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("key", "maintenance_message")
      .maybeSingle();
    const msg = typeof data?.value === "string" ? data.value.trim() : "";
    return msg || DEFAULT_MESSAGE;
  } catch {
    return DEFAULT_MESSAGE;
  }
}

export default async function MaintenancePage() {
  const message = await getMessage();

  return (
    <div className="min-h-screen bg-[#082a63] flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1b57d8] to-transparent" />

      <div className="relative w-24 h-24 mb-8 mx-auto">
        <Image src="/images/logo.png" alt="Goa State Open School" fill sizes="96px" className="object-contain drop-shadow-lg" />
      </div>

      <p className="text-[#5db0f4] text-xs font-bold tracking-[0.25em] uppercase mb-1">
        Goa State Open School
      </p>
      <p lang="kok" className="font-devanagari text-[#5db0f4] text-sm font-semibold mb-3">
        गोंय राज्य मुक्त शाळा
      </p>

      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-1 leading-tight">
        Site Under Maintenance
      </h1>
      <p lang="kok" className="font-devanagari text-lg text-white/80 mb-4">
        साइट देखभालीखातीर बंद आसा
      </p>

      <div className="w-16 h-px bg-[#1b57d8] mx-auto mb-6" />

      <p className="text-white/70 max-w-md leading-relaxed text-sm mb-3 whitespace-pre-line" id="maintenance-msg">
        {message}
      </p>
      <p lang="kok" className="font-devanagari text-white/60 max-w-md leading-relaxed text-sm mb-10">
        आमी सध्या देखभालीचें काम करतात. कृपया थोड्या वेळान परत येयात. गैरसोयी खातीर क्षमा.
      </p>

      {/* Animated dots */}
      <div className="flex gap-2 mb-10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1b57d8] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-[#1b57d8] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-[#1b57d8] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>

      <p className="text-white/40 text-xs">For urgent enquiries, please visit the Contact page after the site is back.</p>
    </div>
  );
}
