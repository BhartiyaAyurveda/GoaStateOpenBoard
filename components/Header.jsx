import Image from "next/image";
import { getContactInfo } from "@/lib/site-settings";

export default async function Header() {
  const { registrationNote, registrationUrl } = await getContactInfo();
  return (
    <header className="print:hidden relative overflow-hidden border-b border-[#d6e3f5] bg-gradient-to-b from-[#f4f8fe] to-white">
      <Image
        src="/images/skyline.webp"
        alt=""
        width={1000}
        height={333}
        priority
        className="pointer-events-none absolute bottom-0 right-0 hidden h-[118px] w-auto select-none lg:block"
      />
      <div className="relative mx-auto flex min-h-[72px] max-w-[1320px] items-center px-4 py-3 sm:min-h-[120px] sm:flex-wrap sm:gap-y-3 sm:px-6 md:flex-nowrap md:gap-y-0 md:py-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/images/logo.png"
              alt="Goa State Open School logo"
              width={480}
              height={266}
              priority
              className="h-[38px] w-auto shrink-0 sm:h-[64px]"
            />
            <div className="min-w-0">
              <h1 className="font-serif text-[18px] font-bold leading-[1.05] tracking-[-0.02em] text-navy-deep sm:text-[28px] sm:leading-none md:text-[31px]">
                GOA STATE OPEN SCHOOL
              </h1>
              <p lang="kok" className="mt-1 font-devanagari text-[13px] font-semibold leading-tight text-navy sm:mt-1.5 sm:text-[18px]">
                गोंय राज्य मुक्त शाळा
              </p>
            </div>
          </div>
          <div className="mt-1.5 hidden border-t border-[#b5bdca] pt-2 text-[11px] font-semibold tracking-[-0.02em] text-navy sm:block">
            OPEN SCHOOLING <span className="mx-1.5 font-normal">|</span> FLEXIBLE LEARNING{" "}
            <span className="mx-1.5 font-normal">|</span> SECOND CHANCE EDUCATION
          </div>
          {registrationNote && (
            <p className="mt-1 text-[11px] font-semibold leading-snug text-[#44557a] sm:text-[11.5px]">
              {registrationUrl ? (
                <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-brand">
                  {registrationNote}
                </a>
              ) : (
                registrationNote
              )}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
