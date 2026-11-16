export default function SectionTitle({ children, light = false }) {
  const line = light ? "bg-sky" : "bg-brand";
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={`h-[2px] w-6 shrink-0 sm:w-14 ${line}`} />
      <h2
        className={`text-[24px] font-bold leading-none tracking-tight sm:text-[30px] ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {children}
      </h2>
      <span className={`h-[2px] w-6 shrink-0 sm:w-14 ${line}`} />
    </div>
  );
}
