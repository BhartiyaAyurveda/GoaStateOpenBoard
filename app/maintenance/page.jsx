import Image from "next/image";

export const metadata = { title: "Maintenance | Goa Open School" };

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#082a63] flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1b57d8] to-transparent" />

      <div className="relative w-24 h-24 mb-8 mx-auto">
        <Image src="/images/logo.png" alt="Goa Open School" fill sizes="96px" className="object-contain drop-shadow-lg" />
      </div>

      <p className="text-[#1b57d8] text-xs font-bold tracking-[0.25em] uppercase mb-3">
        Goa Open School
      </p>

      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4 leading-tight">
        Site Under Maintenance
      </h1>

      <div className="w-16 h-px bg-[#1b57d8] mx-auto mb-6" />

      <p className="text-white/60 max-w-md leading-relaxed text-sm mb-10" id="maintenance-msg">
        We are currently undergoing scheduled maintenance to improve your experience.
        Please check back shortly. We apologize for the inconvenience.
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
