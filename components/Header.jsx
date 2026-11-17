import Image from "next/image";

export default function Header() {
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
      <div className="relative mx-auto flex min-h-[96px] max-w-[1320px] flex-wrap items-center gap-y-3 px-4 py-3 sm:min-h-[120px] sm:px-6 md:flex-nowrap md:gap-y-0 md:py-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/images/emblem-top.png"
            alt="Emblem of India"
            width={240}
            height={360}
            priority
            className="h-[66px] w-auto mix-blend-multiply sm:h-[92px]"
          />
        </div>

        <span className="mx-5 hidden h-[62px] w-px bg-[#8f9bb0] md:block lg:mx-8" />

        <div className="w-full border-t border-[#c9d3e6] pt-3 md:w-auto md:border-0 md:pt-0">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Goa State Open School logo"
              width={480}
              height={266}
              priority
              className="h-[40px] w-auto sm:h-[54px]"
            />
            <div>
              <h1 className="font-serif text-[24px] font-bold leading-none tracking-[-0.02em] text-navy-deep sm:text-[28px] md:text-[31px]">
                GOA STATE OPEN SCHOOL
              </h1>
              <p lang="kok" className="mt-1.5 font-devanagari text-[15px] font-semibold leading-tight text-navy sm:text-[18px]">
                गोंय राज्य मुक्त शाळा
              </p>
            </div>
          </div>
          <div className="mt-1.5 hidden border-t border-[#b5bdca] pt-2 text-[11px] font-semibold tracking-[-0.02em] text-navy sm:block">
            OPEN SCHOOLING <span className="mx-1.5 font-normal">|</span> FLEXIBLE LEARNING{" "}
            <span className="mx-1.5 font-normal">|</span> SECOND CHANCE EDUCATION
          </div>
        </div>
      </div>
    </header>
  );
}
