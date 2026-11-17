"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, RefreshCw, Hash, Users } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";

const TYPE_LABELS = {
  missing_roll_no: { label: "Missing Roll No.", color: "bg-amber-100 text-amber-800 border-amber-300" },
  duplicate_roll_no: { label: "Duplicate Roll No.", color: "bg-red-100 text-red-800 border-red-300" },
  missing_enrollment_no: { label: "Missing Enrollment No.", color: "bg-blue-100 text-blue-800 border-blue-300" },
};

const Pill = ({ type }) => (
  <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12.5px] font-bold ${TYPE_LABELS[type]?.color || "bg-gray-100 text-gray-700 border-gray-300"}`}>
    {TYPE_LABELS[type]?.label || type}
  </span>
);

export default function RollNumberAuditPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roll-numbers/audit-mismatches");
      const json = await res.json();
      if (!res.ok) setError(json.error || "Failed to load audit");
      else setData(json);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = data?.mismatches?.filter((m) => typeFilter === "all" || m.type === typeFilter) || [];
  const withRoll = data ? data.total_approved - (data.mismatches?.filter((m) => m.type === "missing_roll_no").length || 0) : 0;

  const stats = data
    ? [
        { label: "Total approved", value: data.total_approved, Icon: Users, tone: "bg-[#eaf2fd] text-[#1245b8]" },
        {
          label: "Mismatches found",
          value: data.mismatch_count,
          Icon: data.mismatch_count > 0 ? AlertTriangle : CheckCircle2,
          tone: data.mismatch_count > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700",
          alert: data.mismatch_count > 0,
        },
        { label: "With roll no.", value: withRoll, Icon: Hash, tone: "bg-[#eaf2fd] text-[#1b57d8]" },
      ]
    : [];

  const actions = (
    <button
      onClick={load}
      disabled={loading}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#082a63] px-3.5 text-[14px] font-bold text-white transition hover:bg-[#0b3a85] disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh audit</span>
    </button>
  );

  return (
    <AdminPageShell
      title="Roll Number Audit"
      subtitle="Duplicate roll numbers, missing assignments and enrollment gaps"
      backHref="/super-admin/dashboard/exam-management"
      backLabel="Exam Hub"
      actions={actions}
    >
      <div className="space-y-5">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[15px] font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" />
          </div>
        ) : (
          data && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map(({ label, value, Icon, tone, alert }) => (
                  <div key={label} className={`flex items-center gap-3.5 rounded-2xl border bg-white p-4 shadow-sm ${alert ? "border-red-200" : "border-[#d3e1f5]"}`}>
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#3d5688]">{label}</p>
                      <p className={`text-[26px] font-extrabold leading-none ${alert ? "text-red-700" : "text-[#082a63]"}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {data.mismatch_count === 0 ? (
                <div className="rounded-2xl border border-[#d3e1f5] bg-white px-4 py-16 text-center shadow-sm">
                  <CheckCircle2 className="mx-auto mb-3 h-11 w-11 text-emerald-500" />
                  <p className="text-[18px] font-bold text-[#082a63]">All clear</p>
                  <p className="mt-1 text-[14.5px] text-[#3d5688]">No roll number mismatches or issues found.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {[{ key: "all", label: `All (${data.mismatch_count})` }, ...Object.keys(TYPE_LABELS)
                      .map((type) => ({ key: type, label: TYPE_LABELS[type].label, count: data.mismatches?.filter((m) => m.type === type).length || 0 }))
                      .filter((t) => t.count)
                      .map((t) => ({ key: t.key, label: `${t.label} (${t.count})` }))].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setTypeFilter(f.key)}
                        aria-pressed={typeFilter === f.key}
                        className={`h-10 rounded-xl px-4 text-[14px] font-bold transition ${
                          typeFilter === f.key ? "bg-[#082a63] text-white shadow-sm" : "border border-[#d3e1f5] bg-white text-[#3d5688] hover:bg-[#f4f8fe]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
                    {/* table (laptops) */}
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full text-left text-[15px]">
                        <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
                          <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                            <th className="px-5 py-3.5">Type</th>
                            <th className="px-4 py-3.5">Candidate</th>
                            <th className="px-4 py-3.5">College</th>
                            <th className="px-4 py-3.5">Issue</th>
                            <th className="px-5 py-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4edf9]">
                          {filtered.map((m, i) => (
                            <tr key={i} className="transition-colors hover:bg-[#f4f8fe]">
                              <td className="px-5 py-3.5"><Pill type={m.type} /></td>
                              <td className="px-4 py-3.5 font-bold text-[#082a63]">{m.candidate_name}</td>
                              <td className="px-4 py-3.5 text-[#3d5688]">{m.college || "—"}</td>
                              <td className="px-4 py-3.5 text-[#082a63]">{m.detail}</td>
                              <td className="px-5 py-3.5 text-right">
                                <Link href={`/super-admin/dashboard/registrations/${m.id}`} className="inline-flex h-9 items-center rounded-lg border border-[#d3e1f5] px-4 text-[14px] font-bold text-[#082a63] transition hover:bg-[#eaf2fd]">
                                  Fix
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* cards (mobile / tablet) */}
                    <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
                      {filtered.map((m, i) => (
                        <div key={i} className="min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-4">
                          <Pill type={m.type} />
                          <p className="mt-2 break-words text-[16px] font-bold text-[#082a63]">{m.candidate_name}</p>
                          <p className="break-words text-[14px] text-[#3d5688]">{m.college || "—"}</p>
                          <p className="mt-1.5 break-words text-[14.5px] text-[#082a63]">{m.detail}</p>
                          <Link href={`/super-admin/dashboard/registrations/${m.id}`} className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#d3e1f5] text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#eaf2fd]">
                            Fix this record
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )
        )}
      </div>
    </AdminPageShell>
  );
}
