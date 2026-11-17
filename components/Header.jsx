import Image from "next/image";
import { getContactInfo } from "@/lib/site-settings";

export default async function Header() {
  const { headerLogoUrl, headerLogoAlt, headerLogoLink } = await getContactInfo();
  // plain <img>: the Board can use a logo from any https host
  const logoImg = headerLogoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={headerLogoUrl} alt={headerLogoAlt || "Logo"} className="h-[46px] w-auto max-w-[180px] object-contain" />
  ) : null;
  return (
    <header className="print:hidden relative overflow-hidden border-b border-[#d6e3f5] bg-gradient-to-b from-[#f4f8fe] to-white">
      {headerLogoUrl && (
        <div className="absolute right-4 top-2 z-10 hidden max-w-[360px] flex-col items-end gap-1 text-right text-[11px] font-semibold leading-snug text-[#44557a] md:flex lg:right-6">
          {headerLogoUrl &&
            (headerLogoLink ? (
              <a href={headerLogoLink} target="_blank" rel="noopener noreferrer">
                {logoImg}
              </a>
            ) : (
              logoImg
            ))}
        </div>
      )}
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
              <h1 className="font-serif text-[16px] font-bold leading-[1.05] tracking-[-0.02em] text-navy-deep sm:text-[28px] sm:leading-none md:text-[31px]">
                GOA STATE OPEN SCHOOL
              </h1>
              <p lang="kok" className="mt-1 font-devanagari text-[13px] font-semibold leading-tight text-navy sm:mt-1.5 sm:text-[18px]">
                गोंय राज्य मुक्त शाळा
              </p>
            </div>
          </div>
          <div className="mt-1.5 border-t border-[#b5bdca] pt-1.5 text-[8px] font-semibold leading-snug tracking-[-0.02em] text-navy sm:pt-2 sm:text-[11px]">
            <span className="block whitespace-nowrap sm:inline">
              OPEN SCHOOLING <span className="mx-1 font-normal sm:mx-1.5">|</span> FLEXIBLE LEARNING
            </span>
            <span className="mx-1.5 hidden font-normal sm:inline">|</span>
            <span className="block whitespace-nowrap sm:inline">
              SECOND CHANCE EDUCATION <span className="mx-1 font-normal sm:mx-1.5">|</span>{" "}
              <span className="font-extrabold">AN AUTONOMOUS BODY</span>
            </span>
          </div>
        </div>
        <div className="ml-2 flex shrink-0 flex-col items-center justify-center self-stretch sm:ml-6">
          <Image
            src="/images/emblem-nav.png"
            alt="Emblem of India"
            width={128}
            height={200}
            className="h-[58px] w-auto sm:h-[72px] md:h-[84px]"
          />
          <p lang="hi" className="mt-0.5 font-devanagari text-[7px] font-bold leading-none text-[#44557a] sm:text-[8px]">नीति आयोग</p>
          <p className="mt-0.5 whitespace-nowrap text-center text-[7px] font-semibold leading-[1.2] text-[#44557a] sm:text-[9px]">
            Recognized
            <br />
            MSME Trust<span className="hidden sm:inline"> - </span>
            <br className="sm:hidden" />
            Education Act
          </p>
        </div>
      </div>
    </header>
  );
}
