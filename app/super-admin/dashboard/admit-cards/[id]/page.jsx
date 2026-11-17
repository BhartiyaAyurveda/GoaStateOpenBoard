"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Printer, RefreshCw, AlertTriangle } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import AdmitCardTemplate from "@/components/admin/AdmitCardTemplate";

export default function AdminAdmitCardPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/admit-cards/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setData(j.data);
        else setError(j.error || "Failed to load");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [id]);

  const actions =
    !loading && !error ? (
      <button
        onClick={() => window.print()}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1b57d8] px-3.5 text-[14px] font-bold text-white transition hover:bg-[#1245b8] sm:px-4"
      >
        <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print / Save PDF</span>
        <span className="sm:hidden">Print</span>
      </button>
    ) : null;

  return (
    <AdminPageShell
      title="Admit Card"
      subtitle={data?.candidate_name ? `${data.candidate_name}${data.roll_no ? ` · Roll no. ${data.roll_no}` : ""}` : "Preview and print"}
      backHref={`/super-admin/dashboard/registrations/${id}`}
      backLabel="Registration"
      actions={actions}
    >
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" />
        </div>
      ) : error ? (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-[15px] font-semibold text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      ) : (
        <div className="mx-auto max-w-[860px] overflow-x-auto print:m-0 print:w-full print:max-w-none print:overflow-visible print:p-0">
          <AdmitCardTemplate data={data} />
        </div>
      )}
    </AdminPageShell>
  );
}
