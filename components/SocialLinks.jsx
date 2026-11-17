import { getSocialLinks } from "@/lib/social-links";
import SocialIcon from "@/components/icons/SocialIcon";

// Row of round social icons. Renders nothing when no profile is switched on in the dashboard.
// tone="dark" for the navy footer, tone="light" for white panels.
export default async function SocialLinks({ title = "Follow Us", tone = "dark", className = "" }) {
  const links = await getSocialLinks();
  if (!links.length) return null;

  const circle =
    tone === "dark"
      ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/25"
      : "border border-[#c9daf2] bg-[#e9f1fc] text-navy hover:border-brand hover:bg-brand hover:text-white";

  return (
    <div className={className}>
      {title && (
        <p className={`mb-2.5 text-[13px] font-bold uppercase tracking-wider ${tone === "dark" ? "text-white/80" : "text-[#5b6b8c]"}`}>{title}</p>
      )}
      <ul className="flex flex-wrap gap-2.5">
        {links.map(({ id, name, url }) => (
          <li key={id}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} (opens in a new tab)`}
              title={name}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${circle}`}
            >
              <SocialIcon id={id} className="h-[18px] w-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
