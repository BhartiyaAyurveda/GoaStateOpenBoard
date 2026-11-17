"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, HelpCircle } from "lucide-react";

/**
 * Replacement for the browser's window.confirm(): a styled dialog that resolves a promise.
 *
 *   const [confirm, confirmDialog] = useConfirm();
 *   ...
 *   if (!(await confirm({ title: "Delete subject?", message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
 *   ...
 *   return (<>{...page...}{confirmDialog}</>);
 *
 * `confirm("plain message")` also works. Escape / backdrop / Cancel resolve false.
 */
export function ConfirmDialog({ title = "Are you sure?", message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  const Icon = danger ? AlertTriangle : HelpCircle;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06204f]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#d3e1f5] bg-white p-6 text-center shadow-2xl">
        <span className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${danger ? "bg-red-100 text-red-600" : "bg-[#eaf2fd] text-[#1b57d8]"}`}>
          <Icon className="h-6 w-6" />
        </span>
        <h4 className="text-[18px] font-extrabold text-[#082a63]">{title}</h4>
        {message && <p className="mb-5 mt-1.5 whitespace-pre-line text-[14.5px] leading-relaxed text-[#3d5688]">{message}</p>}
        <div className={`grid grid-cols-2 gap-2.5 ${message ? "" : "mt-5"}`}>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-[#d3e1f5] bg-white text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 rounded-xl text-[15px] font-bold text-white transition ${danger ? "bg-red-600 hover:bg-red-700" : "bg-[#1b57d8] hover:bg-[#1245b8]"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function useConfirm() {
  const [opts, setOpts] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (o) =>
      new Promise((resolve) => {
        resolver.current?.(false); // a second call cancels the first
        resolver.current = resolve;
        setOpts(typeof o === "string" ? { message: o } : o || {});
      }),
    [],
  );

  const settle = useCallback((value) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  }, []);

  const dialog = opts ? <ConfirmDialog {...opts} onConfirm={() => settle(true)} onCancel={() => settle(false)} /> : null;
  return [confirm, dialog];
}
