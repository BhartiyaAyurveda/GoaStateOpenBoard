"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Dashboard modal: centred popup on laptops, full screen on phones.
 * Rendered in a portal on <body>, closes with Escape / backdrop click / the X button
 * (all blocked while `busy`), and locks the page scroll behind it.
 *
 * Pass `onSubmit` to render the whole modal as a <form> (put the submit button in `footer`).
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  busy = false,
  size = "sm:max-w-2xl",
  onSubmit,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  const Panel = onSubmit ? "form" : "div";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden overscroll-contain bg-[#06204f]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <Panel
        {...(onSubmit ? { onSubmit } : {})}
        className={`min-h-full w-full min-w-0 bg-white sm:my-auto sm:flex sm:min-h-0 sm:max-h-[calc(100dvh-3rem)] sm:flex-col ${size} sm:overflow-hidden sm:rounded-3xl sm:border sm:border-[#d3e1f5] sm:shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-gradient-to-r from-[#e3edfa] to-white p-4 sm:static sm:shrink-0 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b57d8] text-white">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="text-[18px] font-extrabold leading-tight text-[#082a63]">{title}</h3>
              {subtitle && <p className="text-[13px] text-[#4a6090]">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            aria-label="Close"
            className="shrink-0 rounded-lg bg-white/70 p-2 text-[#4a6090] hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-w-0 p-4 sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:overscroll-contain sm:p-6">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-[#e3edfa] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:shrink-0 sm:flex-row sm:items-center sm:justify-end sm:p-5">
            {footer}
          </div>
        )}
      </Panel>
    </div>,
    document.body,
  );
}
