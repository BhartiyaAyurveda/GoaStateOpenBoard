import Image from "next/image";
import { SquarePen, ArrowRight, Info } from "lucide-react";
import { getHomeContent } from "@/lib/home-content";
import { homeLinkProps, homeImageProps } from "@/lib/home-defaults";

export default async function Hero() {
  const { hero } = await getHomeContent();
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#bcdcf8] via-[#d8ebfc] to-white max-sm:from-[#c4e0fa] max-sm:via-[#e4f1fd]">
      <div className="relative sm:h-[446px] md:h-[clamp(456px,calc(40vw+6px),606px)]">
        {/* tablet / desktop: photo behind the text */}
        <Image
          {...homeImageProps(hero.image, 1920)}
          alt={hero.imageAlt}
          fill
          sizes="100vw"
          className="-z-10 hidden object-cover object-[75%_30%] sm:block"
        />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-white from-0% via-white/85 via-35% to-transparent to-62% sm:block" />

        <svg
          aria-hidden="true"
          viewBox="0 0 600 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden h-[34%] w-[62%] sm:block"
        >
          <defs>
            <linearGradient id="swoosh" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#0d3a9c" />
              <stop offset="0.6" stopColor="#2a73e0" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 30 C140 70 300 100 560 112 L560 120 L0 120 Z" fill="url(#swoosh)" />
        </svg>

        <div className="mx-auto flex max-w-[1320px] flex-col justify-center px-4 max-sm:pb-6 max-sm:pt-9 sm:h-full sm:px-6">
          <span className="mb-4 block h-[2px] w-[53px] bg-brand" />
          <h2 className="max-w-[470px] font-serif text-[38px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[46px] md:max-w-[560px] md:text-[54px]">
            {hero.heading}
          </h2>
          <p className="mt-5 max-w-[360px] text-[15.5px] font-medium leading-[1.55] text-ink sm:max-w-[410px] sm:text-[17px] md:mt-6 md:max-w-[470px] md:text-[19px]">
            {hero.text}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3.5 sm:gap-4">
            {hero.primary.label && (
              <a
                href={hero.primary.href}
                {...homeLinkProps(hero.primary.href)}
                className="flex h-[46px] items-center gap-2.5 rounded-md bg-gradient-to-b from-[#2b6ae6] to-[#1048bd] px-5 text-[15px] font-semibold text-white shadow-md shadow-blue-900/30 hover:brightness-110 sm:h-[44px]"
              >
                <SquarePen size={17} /> {hero.primary.label} <ArrowRight size={16} />
              </a>
            )}
            {hero.secondary.label && (
              <a
                href={hero.secondary.href}
                {...homeLinkProps(hero.secondary.href)}
                className="flex h-[46px] items-center gap-2.5 rounded-md border border-[#9db7e0] bg-white/80 px-5 text-[15px] font-semibold text-ink backdrop-blur-sm hover:bg-white sm:h-[44px] sm:bg-white/70"
              >
                <Info size={17} /> {hero.secondary.label}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* phone: the photo sits below the text, fading into the sky, with a blue wave at the bottom */}
      <div className="relative sm:hidden">
        {/* plain <img>: the photo is shown in its own proportions (not cropped to a fixed height) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={homeImageProps(hero.imageMobile, 900).src} alt={hero.imageAlt} className="block h-auto w-full" loading="eager" decoding="async" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#e4f1fd] via-[#e4f1fd]/70 to-transparent" aria-hidden="true" />
        <svg aria-hidden="true" viewBox="0 0 390 70" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[52px] w-full">
          <defs>
            <linearGradient id="wave-m" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#0d3a9c" />
              <stop offset="1" stopColor="#3b8cf0" />
            </linearGradient>
          </defs>
          <path d="M0 34 C110 66 250 50 390 6 L390 70 L0 70 Z" fill="url(#wave-m)" />
          <path d="M0 48 C120 70 260 58 390 22 L390 70 L0 70 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
