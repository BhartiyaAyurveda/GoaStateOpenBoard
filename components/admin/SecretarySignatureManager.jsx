"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ImagePlus, RefreshCw, Trash2, Upload } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { resetSecretarySignatureCache } from "@/components/useSecretarySignature";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB is plenty for a signature scan

// Board dashboard > Signature: the Secretary's signature printed on the result marksheet.
// Upload a new picture any time; it replaces the old one on every marksheet straight away.
export default function SecretarySignatureManager({ onShowToast }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, confirmDialog] = useConfirm();
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.ok) return;
        try {
          const parsed = JSON.parse(d.settings?.secretary_signature || "{}");
          if (typeof parsed?.url === "string") setUrl(parsed.url);
        } catch {
          /* nothing saved yet */
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function save(nextUrl) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "secretary_signature", value: JSON.stringify({ url: nextUrl }) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Could not save the signature.");
    resetSecretarySignatureCache();
  }

  async function onPick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return setError("Please choose a PNG, JPG or WEBP picture.");
    if (file.size > MAX_BYTES) return setError("The picture is larger than 2 MB. Please choose a smaller one.");

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok || !upData.url) throw new Error(upData.error || "Upload failed. Please try again.");
      await save(upData.url);
      setUrl(upData.url);
      onShowToast?.("Signature saved. It now appears on the marksheets.", "success");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    if (!(await confirm({ title: "Remove the signature?", message: "The marksheets will show an empty signature line until you upload a new one.", confirmLabel: "Remove", danger: true }))) return;
    setBusy(true);
    setError("");
    try {
      await save("");
      setUrl("");
      onShowToast?.("Signature removed.", "success");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#082a63]">Secretary signature</h2>
        <p className="text-[14px] text-[#3d5688] sm:text-[15px]">The signature printed above &quot;Secretary&quot; on every result marksheet. You can change it whenever you like.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
        <div className="border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
          <h3 className="text-[15.5px] font-bold text-[#082a63]">Current signature</h3>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[14.5px] font-semibold text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {/* how it looks on the marksheet */}
          <div className="mx-auto w-full max-w-sm rounded-xl border border-[#d3e1f5] bg-white p-5 text-center">
            {loading ? (
              <div className="flex h-[88px] items-center justify-center"><RefreshCw className="h-5 w-5 animate-spin text-[#1b57d8]" /></div>
            ) : url ? (
              <div className="flex h-[88px] items-end justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Secretary signature" className="max-h-[88px] max-w-full object-contain mix-blend-multiply" />
              </div>
            ) : (
              <div className="flex h-[88px] items-center justify-center text-[14px] italic text-[#8a97b3]">No signature uploaded yet</div>
            )}
            <div className="mt-1 border-t-[1.5px] border-[#a1a1a1] pt-2">
              <p className="text-[13px] font-extrabold text-[#1b1b1b]">Secretary</p>
              <p className="text-[11.5px] font-semibold text-[#727272]">Goa State Open School</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onPick} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60">
              {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : url ? <Upload className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
              {busy ? "Please wait…" : url ? "Upload a new signature" : "Upload signature"}
            </button>
            {url && (
              <button type="button" onClick={onRemove} disabled={busy}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 text-[15px] font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60">
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            )}
          </div>

          <div className="rounded-xl border border-[#c9daf2] bg-[#eef4fc] p-3.5 text-[13.5px] leading-relaxed text-[#44557a]">
            <p className="mb-1 flex items-center gap-1.5 font-bold text-[#082a63]"><CheckCircle2 className="h-4 w-4 text-[#1b57d8]" /> For a clean result</p>
            <ul className="list-disc space-y-0.5 pl-5">
              <li>Sign with a dark pen on plain white paper and take a straight, well-lit photo or scan.</li>
              <li>Crop the picture close to the signature (little empty space around it).</li>
              <li>PNG, JPG or WEBP, up to 2 MB. A white paper background is blended away automatically.</li>
            </ul>
          </div>
        </div>
      </section>
      {confirmDialog}
    </div>
  );
}
