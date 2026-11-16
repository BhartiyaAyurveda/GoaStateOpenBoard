import Image from "next/image";
import { GraduationCap, Users } from "lucide-react";

const courses = [
  {
    no: "01",
    title: "10th STANDARD",
    sub: "Secondary Programme – Class X",
    text: "Goa Open School offers flexible education and all-round development to its learners. Enroll today and complete your Class X education.",
    icon: Users,
  },
  {
    no: "02",
    title: "12th STANDARD",
    sub: "Senior Secondary Programme – Class XII",
    text: "Choose from a wide range of subjects and move ahead to higher education and careers. Enroll today and complete your Class XII education.",
    icon: GraduationCap,
  },
];

export default function Courses() {
  return (
    <section className="relative isolate mt-12 overflow-hidden bg-gradient-to-r from-[#041a45] via-[#082a63] to-[#0f4a9e] text-white">
      {/* Student image on the right, standing on the bottom edge */}
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[44%] md:block">
        <div className="absolute right-[14%] top-1/2 aspect-square h-[70%] -translate-y-1/2 rounded-full bg-sky/20 blur-3xl" />
        <Image
          src="/images/student.webp"
          alt=""
          fill
          sizes="44vw"
          className="object-contain object-[55%_100%] pt-8 drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
        />
      </div>

      <div className="mx-auto max-w-[1320px] px-4 pb-0 pt-14 sm:px-6 md:py-14 lg:py-16">
        <div className="max-w-[760px]">
          <p className="text-[13.5px] font-bold uppercase tracking-[0.2em] text-sky">Directorate of Education</p>
          <h2 className="mt-2 text-[34px] font-extrabold leading-tight tracking-tight sm:text-[42px]">Our Courses</h2>
          <div className="mt-3 flex items-center gap-2" aria-hidden="true">
            <span className="h-[3px] w-14 bg-sky" />
            <span className="h-[3px] w-3 bg-white/70" />
          </div>
          <p className="mt-4 max-w-[680px] text-[15.5px] font-medium leading-[1.7] text-white/90">
            We offer two programmes that help you build your career. Our study centres bring together modern and latest
            teaching techniques, making Goa Open School an ideal platform for flexible and all-round learning.
          </p>

          <ul className="mt-8 space-y-4">
            {courses.map(({ no, title, sub, text, icon: Icon }) => (
              <li
                key={title}
                className="group flex gap-5 border border-white/25 border-l-[5px] border-l-sky bg-[#041a45]/60 p-5 backdrop-blur-[2px] transition hover:bg-[#041a45]/80"
              >
                <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center border border-[#c9daf2] bg-white text-navy">
                  <Icon size={36} strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="text-[14px] font-bold tracking-widest text-sky">{no}</span>
                    <h3 className="text-[22px] font-bold leading-tight tracking-wide">{title}</h3>
                  </div>
                  <p className="mt-0.5 text-[13.5px] font-bold uppercase tracking-wider text-sky">{sub}</p>
                  <p className="mt-2 text-[14.5px] font-medium leading-[1.65] text-white/90">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* student image: below the courses on mobile (on desktop it sits on the right) */}
        <div className="relative mx-auto mt-6 h-[300px] w-full max-w-[360px] md:hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 aspect-square h-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/25 blur-3xl" />
          <Image
            src="/images/student.webp"
            alt=""
            fill
            sizes="360px"
            className="object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
          />
        </div>
      </div>
    </section>
  );
}
