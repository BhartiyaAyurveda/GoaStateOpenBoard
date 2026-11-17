"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

/**
 * Custom dropdown (listbox) with keyboard support, used instead of the browser's
 * native <select> popup so it matches the dashboard design on every device.
 *
 * The list is rendered in a portal on <body> and positioned against the viewport, so it is never
 * clipped by a scrolling modal / card; it opens upwards when there is not enough room below.
 *
 * <Select value={v} onChange={(value) => ...} options={[{ value, label }]} ariaLabel="..." />
 */
export default function Select({
  value,
  onChange,
  options,
  ariaLabel,
  disabled = false,
  align = "left", // which edge of the button the list lines up with
  size = "md", // dashboard variant: "md" (toolbar, 40px) | "lg" (form field, 44px)
  variant = "dashboard", // "dashboard" | "form" (registration / admin forms, 50px) | "public" (public website forms, 48px)
  withIcon = false, // a field icon is drawn on the left by the parent: leave room for it
  invalid = false, // red border (public / form variants)
  id,
  placeholder = "", // when set, shown if `value` matches no option (otherwise the first option is shown)
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const uid = useId();

  const selectedIndex = useMemo(() => options.findIndex((o) => o.value === value), [options, value]);
  const selected = options[selectedIndex] || (placeholder ? null : options[0]);

  function measure() {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const vh = window.innerHeight;
    const below = vh - r.bottom - 12;
    const above = r.top - 12;
    const up = below < 220 && above > below;
    setPos({
      up,
      left: r.left,
      right: window.innerWidth - r.right,
      width: r.width,
      top: r.bottom + 6,
      bottom: vh - r.top + 6,
      maxH: Math.max(120, Math.min(288, up ? above : below)),
    });
  }

  function openList() {
    if (disabled) return;
    measure();
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function choose(i) {
    const opt = options[i];
    if (opt) onChange(opt.value);
    setOpen(false);
  }

  // close on outside click / touch (the list lives in a portal, so check it separately)
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // keep the list attached to the button while the page / a modal scrolls or the window resizes
  useEffect(() => {
    if (!open) return;
    const onMove = (e) => {
      if (e?.target && listRef.current?.contains(e.target)) return;
      measure();
    };
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  // keep the highlighted option in view while using the keyboard
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function onKeyDown(e) {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(options.length - 1, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
    }
  }

  const base = "flex w-full items-center justify-between gap-2 border text-left outline-none transition disabled:opacity-50";
  let buttonCls;
  if (variant === "public") {
    buttonCls = `${base} h-[48px] rounded-md ${withIcon ? "pl-11 pr-3" : "pl-3.5 pr-3"} text-[14.5px] font-medium text-ink ${
      invalid ? "border-[#e0242b] bg-[#fff8f8]" : open ? "border-brand bg-white ring-4 ring-brand/15" : "border-[#b9cbe6] bg-[#fbfdff] hover:border-[#7fa0d6]"
    }`;
  } else if (variant === "form") {
    buttonCls = `${base} h-[50px] rounded-xl ${withIcon ? "pl-10 pr-3.5" : "px-4"} text-[15px] font-medium text-[#082a63] ${
      invalid ? "border-red-400 bg-red-50" : open ? "border-[#1b57d8] bg-white ring-4 ring-[#1b57d8]/15" : "border-[#d3e1f5] bg-[#f4f8fe] hover:border-[#a9bde0]"
    }`;
  } else {
    buttonCls = `${base} rounded-xl bg-white font-semibold text-[#082a63] ${size === "lg" ? "h-11 px-3.5 text-[15px]" : "h-10 px-3 text-[14px]"} ${
      open ? "border-[#1b57d8] ring-2 ring-[#1b57d8]/15" : "border-[#d3e1f5] hover:border-[#a9bde0] focus-visible:border-[#1b57d8]"
    }`;
  }

  const listStyle = pos
    ? {
        position: "fixed",
        ...(pos.up ? { bottom: pos.bottom } : { top: pos.top }),
        ...(align === "right" ? { right: pos.right } : { left: pos.left }),
        minWidth: pos.width,
        maxHeight: pos.maxH,
      }
    : undefined;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-label={ariaLabel}
        className={buttonCls}
      >
        <span className={`truncate ${selected ? "" : "font-normal text-[#8a97b3]"}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#4a6090] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            id={`${uid}-list`}
            role="listbox"
            aria-label={ariaLabel}
            aria-activedescendant={active >= 0 ? `${uid}-opt-${active}` : undefined}
            style={listStyle}
            className="z-[70] w-max max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain rounded-xl border border-[#d3e1f5] bg-white p-1.5 shadow-[0_10px_30px_rgba(8,42,99,0.18)]"
          >
            {options.map((o, i) => {
              const isSel = o.value === value;
              return (
                <li
                  key={String(o.value)}
                  id={`${uid}-opt-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[14px] ${
                    isSel ? "font-bold text-[#1245b8]" : "font-medium text-[#082a63]"
                  } ${active === i ? "bg-[#eaf2fd]" : ""}`}
                >
                  <span className="min-w-0 break-words">{o.label}</span>
                  {isSel && <Check className="h-4 w-4 shrink-0 text-[#1b57d8]" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
