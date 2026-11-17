"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import SectionTitle from "./SectionTitle";

// SAMPLE CONTENT – these are placeholder testimonials written for the design.
// Replace them with real, consented feedback from learners / parents before
// publishing (do not publish invented testimonials on a live government site).
const testimonials = [
  {
    quote:
      "I had to leave school to support my family. Goa State Open School let me study at my own pace and finally complete my Class X.",
    name: "Rohan N.",
    meta: "Student, Panaji",
  },
  {
    quote:
      "My daughter studies after work and still attends contact classes on weekends. The study material is simple and easy to follow.",
    name: "Mrs. Sunita D.",
    meta: "Parent, Margao",
  },
  {
    quote:
      "The teachers at my study centre explain every topic patiently and are always ready to help with assignments.",
    name: "Priya K.",
    meta: "Student, Mapusa",
  },
  {
    quote:
      "Enrollment card, admit card and results are all available online. It saved me many trips to the office.",
    name: "Aaron F.",
    meta: "Student, Vasco",
  },
  {
    quote:
      "A second chance for my son to complete Class XII. We are grateful for this opportunity.",
    name: "Mr. Santosh P.",
    meta: "Parent, Ponda",
  },
];

const initials = (name) =>
  name
    .replace(/^(Mr|Mrs|Ms|Dr)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function usePerView() {
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const calc = () => setPerView(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return perView;
}

export default function Testimonials() {
  const perView = usePerView();
  const maxIndex = Math.max(0, testimonials.length - perView);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // keep the index valid when the number of visible cards changes
  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [index, maxIndex]);

  // auto-advance (paused on hover / focus, disabled for reduced motion)
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), 6000);
    return () => clearInterval(id);
  }, [paused, maxIndex]);

  const go = (i) => setIndex(Math.min(maxIndex, Math.max(0, i)));
  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const next = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));

  return (
    <section
      id="testimonials"
      className="relative isolate mt-6 overflow-hidden border-t-4 border-sky bg-gradient-to-br from-[#041a45] via-[#082a63] to-[#0f4a9e] py-12 lg:py-16"
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      {/* decorative education-icons pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage: "url(/images/edu-pattern.svg)", backgroundSize: "440px 440px" }}
      />

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <SectionTitle light>Testimonials</SectionTitle>
        <p className="mx-auto mt-3 max-w-[560px] text-center text-[15px] font-medium text-white/85">
          Here is what our learners and their parents say about Goa State Open School.
        </p>

        <div
          className="relative mt-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              className="-mx-2.5 flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
              aria-live={paused ? "polite" : "off"}
            >
              {testimonials.map(({ quote, name, meta }, i) => (
                <div
                  key={name}
                  className="shrink-0 px-2.5 py-2"
                  style={{ flex: `0 0 ${100 / perView}%` }}
                  aria-hidden={i < index || i >= index + perView}
                >
                  <figure className="flex h-full flex-col border border-[#b9cbe6] border-t-4 border-t-navy bg-white p-6 shadow-[0_2px_6px_rgba(8,42,99,0.08)]">
                    <span className="flex h-10 w-10 items-center justify-center bg-navy text-white" aria-hidden="true">
                      <Quote size={22} strokeWidth={2} />
                    </span>
                    <blockquote className="mt-3 flex-1 text-[15px] font-medium leading-[1.7] text-ink">
                      {quote}
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 border-t border-dashed border-[#7fa0d6] pt-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#c9daf2] bg-navy text-[15px] font-bold tracking-wide text-white">
                        {initials(name)}
                      </span>
                      <span className="leading-tight">
                        <span className="block text-[15px] font-bold text-ink">{name}</span>
                        <span className="mt-0.5 block text-[12.5px] font-bold uppercase tracking-wider text-[#5b6b8c]">{meta}</span>
                      </span>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center border border-white bg-white text-navy transition hover:bg-sky hover:border-sky"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose testimonial">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show testimonial group ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-2.5 transition-all ${i === index ? "w-7 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center border border-white bg-white text-navy transition hover:bg-sky hover:border-sky"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
