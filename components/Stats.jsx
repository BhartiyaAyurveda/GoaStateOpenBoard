import { getHomeContent } from "@/lib/home-content";
import { iconByName } from "@/lib/home-icons";

// tall: bigger bar for pages whose spacing is handled by the parent (About)
export default async function Stats({ tall = false }) {
  const { stats } = await getHomeContent();
  return (
    <section
      className={`card-shadow grid grid-cols-2 rounded-lg bg-gradient-to-r from-[#f1f6fd] to-[#e3edfa] ${stats.length === 4 ? "lg:grid-cols-4" : "lg:grid-flow-col lg:auto-cols-fr"} ${
        tall ? "py-12 sm:py-16" : "mb-10 mt-10 py-9"
      }`}
    >
      {stats.map(({ value, label, icon }, i) => {
        const Icon = iconByName(icon, "Users");
        return (
          <div
            key={`${i}-${label}`}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-3 text-center sm:flex-row sm:gap-3 sm:py-2 sm:text-left ${i > 0 ? "lg:border-l lg:border-navy/40" : ""}`}
          >
            <Icon strokeWidth={1.4} className="size-10 shrink-0 text-brand sm:size-14" />
            <div className="leading-tight">
              <p className="font-serif text-[24px] font-bold tracking-tight sm:text-[28px] text-ink">{value}</p>
              <p className="text-[14.5px] font-medium text-ink">{label}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
