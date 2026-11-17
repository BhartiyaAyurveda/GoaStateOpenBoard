"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Landmark, Menu, X, Info, GraduationCap, FileText, IdCard, ChartColumn, Phone, Building2 } from "lucide-react";

function HomeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.6 1.8 11.7a.9.9 0 0 0 .6 1.6H5v7.2c0 .5.4.9.9.9h4.2v-5.6h3.8v5.6h4.2c.5 0 .9-.4.9-.9v-7.2h2.6a.9.9 0 0 0 .6-1.6l-3.2-2.9V4.4c0-.4-.3-.7-.7-.7h-1.6c-.4 0-.7.3-.7.7v1.3L12 2.6Z" />
    </svg>
  );
}

const links = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "About", href: "/about", icon: Info },
  { label: "Courses", href: "/courses", icon: GraduationCap },
  { label: "Study Centres", href: "/study-centres", icon: Building2 },
  { label: "Enrollment Card", href: "/enrollment-card", icon: FileText },
  { label: "Admit Card", href: "/admit-card", icon: IdCard },
  { label: "Result", href: "/result", icon: ChartColumn },
  { label: "Contact", href: "/contact", icon: Phone },
];

export default function NavbarClient({ phone = "0832–2743300", tel = "tel:+918322743300" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef(null);
  const menuBtnRef = useRef(null);

  // close the drawer after navigating to another page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // while the drawer is open: lock page scroll, close on Esc, move focus inside; give focus back on close
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    const btn = menuBtnRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open]);

  // the drawer is mobile-only: close it if the window grows to the desktop layout
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 58rem)");
    const onChange = (e) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <nav className="sticky top-0 z-50 print:hidden bg-gradient-to-r from-[#08265c] via-[#0a3170] to-[#0d3c82] text-white shadow-[0_2px_6px_rgba(4,20,60,0.35)]" aria-label="Primary">
      <div className="mx-auto flex h-[58px] max-w-[1320px] items-center justify-between px-4 sm:px-6">
        <ul className="hidden h-full shrink-0 items-center lg:flex">
          {links.map(({ label, href, icon: Icon }) => {
            const active = href === pathname;
            return (
            <li key={label} className="h-full">
              <Link
                href={href}
                className={`flex h-full items-center gap-1.5 whitespace-nowrap px-[10px] text-[14px] font-bold transition-colors min-[1100px]:px-[22px] min-[1100px]:text-[15px] xl:px-[28px] xl:text-[15.5px] ${
                  active ? "bg-[#2186ea] text-white" : "hover:bg-white/10"
                }`}
              >
                {/* every item has an icon, but only the selected one shows it */}
                {Icon && active && <Icon size={21} strokeWidth={2.2} />}
                {label}
              </Link>
            </li>
            );
          })}
        </ul>

        <button
          ref={menuBtnRef}
          className="flex items-center gap-2 text-sm font-semibold lg:hidden"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Open menu"
        >
          <Menu size={22} /> Menu
        </button>

        <div className="flex items-center gap-3">
          <Link href="/board-login" className="flex h-[40px] items-center gap-2.5 whitespace-nowrap rounded-lg bg-white px-4 text-[14px] font-bold text-navy-deep shadow-sm hover:bg-sky-50">
            <User size={20} fill="currentColor" /> Board Login
          </Link>
          <Link href="/college-login" className="hidden h-[40px] items-center gap-2.5 whitespace-nowrap rounded-lg bg-white px-4 text-[14px] font-bold text-navy-deep shadow-sm hover:bg-sky-50 sm:flex">
            <Landmark size={20} /> College Login
          </Link>
        </div>
      </div>

      {/* mobile sidebar (drawer) */}
      <div
        className={`fixed inset-0 z-[60] bg-navy-deep/65 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        inert={!open}
        className={`fixed inset-y-0 left-0 z-[70] flex w-[300px] max-w-[85vw] flex-col bg-navy-deep text-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/15 bg-white px-4 py-3">
          <Image src="/images/logo.png" alt="Goa State Open School" width={480} height={266} className="h-[32px] w-auto shrink-0" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[13px] font-extrabold leading-tight tracking-tight text-navy-deep">GOA STATE OPEN SCHOOL</p>
            <p lang="kok" className="font-devanagari text-[12px] font-semibold text-navy">गोंय राज्य मुक्त शाळा</p>
          </div>
          <button
            ref={closeRef}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-white hover:bg-brand"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto py-2">
          {links.map(({ label, href, icon: Icon }) => {
            const active = href === pathname;
            return (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 border-l-4 px-5 py-3.5 text-[15px] font-semibold transition-colors ${
                    active ? "border-sky bg-[#2186ea] text-white" : "border-transparent text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon size={20} strokeWidth={2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="space-y-2.5 border-t border-white/15 p-4">
          <Link href="/board-login" onClick={() => setOpen(false)} className="flex h-[44px] w-full items-center justify-center gap-2.5 rounded-lg bg-white text-[14px] font-bold text-navy-deep hover:bg-sky-50">
            <User size={19} fill="currentColor" /> Board Login
          </Link>
          <Link href="/college-login" onClick={() => setOpen(false)} className="flex h-[44px] w-full items-center justify-center gap-2.5 rounded-lg border border-white/50 text-[14px] font-bold text-white hover:bg-white/10">
            <Landmark size={19} /> College Login
          </Link>
          <a href={tel} className="flex items-center justify-center gap-2 pt-1 text-[14px] font-semibold text-white/85 hover:text-sky">
            <Phone size={15} /> {phone}
          </a>
        </div>
      </aside>
    </nav>
  );
}
