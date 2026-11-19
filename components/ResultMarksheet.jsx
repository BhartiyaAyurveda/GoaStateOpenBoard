"use client";

import Image from "next/image";
import useSecretarySignature from "@/components/useSecretarySignature";
import FitCard from "@/components/FitCard";
import PrintFooter from "@/components/PrintFooter";

// Official-style "Statement of Marks" shown to a student after the result lookup (and printed on A4).
// Layout follows the Bhartiya Ayurveda student marksheet: header band, title bar, candidate box with photo,
// subject-wise marks, summary boxes, grading scale and an authorisation strip.

const NAVY = "#2b1722";
const NAVY_2 = "#4a2a3a";
const BRAND = "#e9a8c2";
const BRAND_DARK = "#8a2b57";
const SKY = "#a63a69";

const GRADING = [["A1", "90–100%"], ["A2", "80–89%"], ["B1", "70–79%"], ["B2", "60–69%"], ["C1", "50–59%"], ["C2", "40–49%"], ["D", "33–39%"], ["E", "<33%"]];

const fmtDate = (iso) => {
  if (!iso) return "—";
  const p = String(iso).split("-");
  return p.length === 3 && p[0].length === 4 ? `${p[2]}-${p[1]}-${p[0]}` : iso;
};
const num = (v) => (v === null || v === undefined || v === "" ? "—" : v);

function SectionBar({ children }) {
  return (
    <div style={{ background: "linear-gradient(90deg,#fbd9e7,#fde9f1)" }} className="flex items-center gap-2 px-4 py-1.5">
      <span style={{ width: 3, height: 14, background: BRAND, borderRadius: 2, flexShrink: 0, display: "inline-block" }} />
      <span className="text-[9.5px] font-extrabold uppercase tracking-[0.15em]" style={{ color: "#7a1f46" }}>{children}</span>
    </div>
  );
}

function Row({ label, value, bold, mono, top }) {
  return (
    <div className="flex items-center gap-2 px-4 py-[5px]" style={top ? { alignItems: "flex-start" } : undefined}>
      <span style={{ color: "#727272", fontSize: 9.5, fontWeight: 600, minWidth: 96, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#a1a1a1", fontSize: 10 }}>:</span>
      <span style={{ color: NAVY, fontSize: bold ? 10.5 : 10, fontWeight: 700, fontFamily: mono ? "monospace" : undefined, letterSpacing: mono ? "0.05em" : undefined, lineHeight: 1.4 }}>{value || "—"}</span>
    </div>
  );
}

function Signature({ title, sub, width = 160, imageUrl = "" }) {
  return (
    <div style={{ width, maxWidth: "100%", textAlign: "center" }}>
      <div style={{ height: 44, borderBottom: "1.5px solid #a1a1a1", marginBottom: 6, marginLeft: 8, marginRight: 8, position: "relative" }}>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`${title} signature`} style={{ position: "absolute", left: "50%", bottom: 2, transform: "translateX(-50%)", maxHeight: 42, maxWidth: "92%", objectFit: "contain", mixBlendMode: "multiply" }} />
        )}
        <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: BRAND }} />
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, color: NAVY, letterSpacing: "0.03em" }}>{title}</div>
      <div style={{ fontSize: 8.5, color: "#727272", fontWeight: 600, marginTop: 1 }}>{sub}</div>
    </div>
  );
}

export default function ResultMarksheet({ data }) {
  const secretarySignature = useSecretarySignature();
  if (!data) return null;
  const pass = data.status === "PASS";
  const subjects = data.subjects || [];
  // keep one A4 page whatever the number of subjects: shrink a little when there are more than 6
  const printZoom = subjects.length <= 6 ? 1 : subjects.length === 7 ? 0.95 : subjects.length === 8 ? 0.91 : 0.87;

  return (
    <FitCard>
    <div className="result-marksheet-wrapper doc-card-page mx-auto w-full max-w-[860px] font-sans text-[#171717] shadow-2xl print:shadow-none">
      <style>{`
        @media print {
          html, body { background: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; }
          .result-marksheet-wrapper { width: calc(194mm / ${printZoom}) !important; max-width: calc(194mm / ${printZoom}) !important; margin: 0 auto !important; padding: 8mm 0 6mm 0 !important; zoom: ${printZoom} !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="relative overflow-hidden bg-white" style={{ border: "2px solid #e9a8c2" }}>
        {/* watermark */}
        <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center overflow-hidden" aria-hidden="true">
          <Image src="/images/logo.png" alt="" width={360} height={200} style={{ width: 360, height: "auto", opacity: 0.08, objectFit: "contain" }} />
        </div>

        <div className="relative z-10">
          {/* 1. header band */}
          <div style={{ background: "linear-gradient(135deg,#fbd7e6 0%,#fde6ef 50%,#fff2f7 100%)" }} className="flex items-center gap-3 px-5 py-2 print:py-1.5">
            <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-white" style={{ border: `2px solid ${BRAND}`, boxShadow: `0 0 0 3px ${BRAND}30, 0 2px 8px #00000030` }}>
              <Image src="/images/logo.png" alt="Goa State Open School logo" width={78} height={44} style={{ width: 42, height: "auto", objectFit: "contain" }} />
            </div>
            <div className="flex-1 text-center">
              <div lang="kok" className="font-devanagari text-[15px] font-extrabold leading-tight tracking-wide sm:text-[16px]" style={{ color: SKY }}>
                गोंय राज्य मुक्त शाळा
              </div>
              <h1 className="mt-0.5 text-[11px] font-bold uppercase leading-tight tracking-[0.16em] sm:text-[12px] text-[#5c1736]">Goa State Open School</h1>
              <div className="mt-1 flex items-center justify-center gap-2">
                <div className="h-px max-w-[80px] flex-1" style={{ background: `linear-gradient(90deg,transparent,${BRAND})` }} />
                <span className="whitespace-nowrap px-1 text-[8.5px] font-medium tracking-wider text-[#b0607f]">Open schooling &nbsp;✦&nbsp; Flexible learning &nbsp;✦&nbsp; Second chance education</span>
                <div className="h-px max-w-[80px] flex-1" style={{ background: `linear-gradient(90deg,${BRAND},transparent)` }} />
              </div>
            </div>
            <div className="hidden w-[56px] shrink-0 sm:block" />
          </div>

          {/* stripe */}
          <div style={{ height: 3, background: "linear-gradient(90deg,#f3b9cf,#e58aac,#f3b9cf)" }} />

          {/* a clear gap between the slim header and the title bar */}
          <div style={{ height: 12 }} aria-hidden="true" />

          {/* 2. title */}
          <div style={{ background: "linear-gradient(180deg,#fff7fa,#fdeef4)" }} className="border-b border-[#f0c9d8] px-6 py-2.5 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg,transparent,${BRAND})` }} />
              <div>
                <div className="text-[13px] font-extrabold uppercase tracking-[0.2em]" style={{ color: NAVY }}>
                  Statement of Marks &nbsp;/&nbsp; <span lang="kok" className="font-devanagari normal-case tracking-normal">गूणपत्रिका</span>
                </div>
                <div className="mt-0.5 text-[9.5px] font-semibold tracking-wider" style={{ color: BRAND_DARK }}>
                  {[data.session].filter(Boolean).join("  •  ")}
                </div>
              </div>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg,${BRAND},transparent)` }} />
            </div>
          </div>

          <div className="space-y-3 px-5 pb-8 pt-4 sm:px-6 print:space-y-2 print:px-4 print:pb-4 print:pt-3">
            {/* 3. candidate + photo */}
            <div className="overflow-hidden bg-white" style={{ border: `1px solid ${BRAND}`, borderRadius: 4 }}>
              <SectionBar>Candidate &amp; Examination Particulars</SectionBar>
              <div className="flex items-stretch">
                <div className="min-w-0 flex-1">
                  {[
                    [["Candidate Name", data.name?.toUpperCase(), true], ["Roll Number", data.rollNo, true, true]],
                    [["Father's Name", data.fatherName?.toUpperCase()], ["Enrollment No.", data.enrolmentNo, false, true]],
                    [["Mother's Name", data.motherName?.toUpperCase()], ["Date of Birth", fmtDate(data.dob)]],
                  ].map((row, ri) => (
                    <div key={ri} className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2" style={{ borderBottom: "1px dashed #f3d3df" }}>
                      {row.map(([label, val, bold, mono]) => (
                        <Row key={label} label={label} value={val} bold={bold} mono={mono} />
                      ))}
                    </div>
                  ))}
                  <div style={{ borderBottom: "1px dashed #f3d3df" }}>
                    <Row label="Programme / Course" value={data.course?.toUpperCase()} top />
                  </div>
                  <Row label="Study Centre" value={`${data.institute || ""}${data.instituteCode ? ` (${data.instituteCode})` : ""}`.toUpperCase()} top />
                </div>

                <div className="flex w-[96px] shrink-0 flex-col items-center justify-center gap-1 p-2" style={{ borderLeft: "1px dashed #f3d3df", background: "#fff7fa" }}>
                  <div style={{ border: `2px solid ${NAVY}`, width: 78, height: 100, overflow: "hidden", background: "#f4f4f4", position: "relative", boxShadow: "2px 2px 6px #00000033" }}>
                    {data.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.photoUrl} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <svg style={{ width: 24, height: 24, color: `${NAVY}40` }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <span style={{ fontSize: 7, fontWeight: 700, color: `${NAVY}80`, textAlign: "center", lineHeight: 1.3, textTransform: "uppercase" }}>Candidate<br />Photo</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 7.5, color: "#727272", textAlign: "center" }}>Passport Size</div>
                </div>
              </div>
            </div>

            {/* 4. marks */}
            <div className="overflow-hidden bg-white" style={{ border: `1px solid ${BRAND}`, borderRadius: 4 }}>
              <SectionBar>Subject-Wise Marks / <span lang="kok" className="font-devanagari normal-case tracking-normal">विशयवार गूण</span></SectionBar>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr style={{ background: "#fbd9e7" }} className="text-[#7a1f46]">
                      <th className="border-r border-white/10 px-2 py-2.5 text-center font-bold uppercase tracking-wide" style={{ width: "10%", fontSize: 11 }}>Code</th>
                      <th className="border-r border-white/10 px-3 py-2.5 font-bold uppercase tracking-wide" style={{ width: "31%", fontSize: 11 }}>Subject Name</th>
                      {[["Theory", "marks / max"], ["Practical", "marks / max"], ["CA", "marks / max"], ["Total", "marks / max"]].map(([a, b]) => (
                        <th key={a} className="border-r border-white/10 px-2 py-2.5 text-center font-bold uppercase tracking-wide" style={{ fontSize: 10.5 }}>
                          {a}<br /><span style={{ fontWeight: 400, fontSize: 8, color: "#b0607f", textTransform: "none" }}>{b}</span>
                        </th>
                      ))}
                      <th className="px-2 py-2.5 text-center font-bold uppercase tracking-wide" style={{ width: "8%", fontSize: 11 }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s, i) => (
                      <tr key={`${s.code}-${i}`} style={{ background: !s.pass ? "#f5f5f5" : i % 2 === 0 ? "#ffffff" : "#fff7fa", borderBottom: "1px solid #f3d3df" }}>
                        <td className="border-r border-slate-200 px-2 py-2 print:py-1.5 text-center font-mono font-extrabold" style={{ color: BRAND_DARK, fontSize: 9.5 }}>{s.code || "—"}</td>
                        <td className="border-r border-slate-200 px-3 py-2 print:py-1.5" style={{ fontWeight: 700, color: NAVY, fontSize: 12 }}>{s.name}</td>
                        {[[s.thObt, s.thMax], [s.prObt, s.prMax], [s.caObt, s.caMax]].map(([obt, max], k) => (
                          <td key={k} className="border-r border-slate-200 px-2 py-2 print:py-1.5 text-center font-mono" style={{ fontSize: 10 }}>
                            {max > 0 ? (
                              <>
                                <span style={{ fontWeight: 800, color: NAVY }}>{num(obt)}</span>
                                <span style={{ color: "#a1a1a1", fontSize: 8.5, fontWeight: 600 }}> / {max}</span>
                              </>
                            ) : (
                              <span style={{ color: "#d3d3d3" }}>—</span>
                            )}
                          </td>
                        ))}
                        <td className={`border-r border-slate-200 px-2 py-2 print:py-1.5 text-center font-mono ${!s.pass ? "text-black" : ""}`} style={{ color: s.pass ? NAVY : undefined }}>
                          <span style={{ fontSize: 11.5, fontWeight: 900 }}>{s.totalObt}</span>
                          <span style={{ color: "#a1a1a1", fontSize: 8.5, fontWeight: 600 }}> / {s.totalMax}</span>
                        </td>
                        <td className="px-2 py-2 print:py-1.5 text-center font-extrabold" style={{ fontSize: 11, color: s.pass ? BRAND_DARK : "#000000" }}>{s.grade || "—"}</td>
                      </tr>
                    ))}
                    <tr style={{ background: "linear-gradient(90deg,#fbd9e7,#fde9f1)", borderTop: `2px solid ${BRAND}` }}>
                      <td colSpan={5} className="border-r border-[#f0b5cb] px-3 py-2.5 text-right" style={{ fontSize: 9.5, fontWeight: 800, color: SKY, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Grand Total / <span lang="kok" className="font-devanagari normal-case tracking-normal">एकूण गूण</span>
                      </td>
                      <td className="border-r border-[#f0b5cb] px-2 py-2.5 text-center font-mono font-extrabold" style={{ color: SKY }}>
                        <span style={{ fontSize: 13 }}>{data.grandTotalObt}</span>
                        <span style={{ color: "#b0607f", fontSize: 9, fontWeight: 600 }}> / {data.grandTotalMax}</span>
                      </td>
                      <td className={`px-2 py-2.5 text-center text-[12px] font-extrabold ${pass ? "" : "text-red-600"}`} style={pass ? { color: SKY } : undefined}>{data.status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. summary */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Total Marks", value: data.grandTotalObt, sub: `out of ${data.grandTotalMax}`, tone: "brand" },
                { label: "Percentage", value: `${data.percentage}%`, sub: pass ? "Passed" : "Not passed", tone: "brand" },
                { label: "Final Result", value: pass ? "✓ PASS" : "✗ FAIL", sub: pass ? "उत्तीर्ण" : "अनुत्तीर्ण", tone: pass ? "brand" : "red", kok: true },
              ].map((b) => (
                <div key={b.label} style={{
                  border: `1.5px solid ${b.tone === "red" ? "#5c5c5c" : BRAND}`, borderRadius: 6,
                  background: b.tone === "red" ? "linear-gradient(135deg,#f6f6f6,#eaeaea)" : "linear-gradient(135deg,#fff5f9,#fde9f1)",
                  padding: "10px 8px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 8, color: b.tone === "red" ? "#4b4b4b" : BRAND_DARK, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{b.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, color: b.tone === "red" ? "#5c5c5c" : NAVY, fontFamily: b.kok ? undefined : "monospace" }}>{b.value}</div>
                  <div lang={b.kok ? "kok" : undefined} className={b.kok ? "font-devanagari" : ""} style={{ fontSize: 9, fontWeight: 700, marginTop: 3, color: b.tone === "red" ? "#5c5c5c" : BRAND_DARK }}>{b.sub}</div>
                </div>
              ))}
            </div>

            {/* 6. grading scale */}
            <div style={{ border: "1px solid #d3d3d3", borderRadius: 4, background: "#fff7fa", padding: "7px 14px" }}>
              <span style={{ fontSize: 8.5, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 10 }}>Grading Scale:</span>
              {GRADING.map(([g, r]) => (
                <span key={g} style={{ marginRight: 10, fontSize: 10, color: "#535353", whiteSpace: "nowrap" }}>
                  <strong style={{ color: g === "E" ? "#5c5c5c" : g === "D" ? "#686868" : NAVY, fontSize: 10.5 }}>{g}</strong> {r}
                </span>
              ))}
              <span style={{ fontSize: 9, fontWeight: 700, color: NAVY, marginLeft: 6, paddingLeft: 10, borderLeft: `1px solid ${BRAND}`, whiteSpace: "nowrap" }}>✦ Min. Pass: 33%</span>
            </div>

            {/* 7. authorisation */}
            <div style={{ border: `1px solid ${BRAND}`, borderRadius: 4, overflow: "hidden" }}>
              <SectionBar>Authorisation &amp; Verification</SectionBar>
              <div className="flex flex-wrap items-center justify-around gap-6 px-7 py-3" style={{ background: "linear-gradient(180deg,#ffffff,#fff7fa)" }}>
                <Signature title="Secretary" sub="Goa State Open School" width={220} imageUrl={secretarySignature} />
              </div>
            </div>

            <p className="text-center text-[9.5px] font-medium leading-relaxed text-[#727272]">
              This is a provisional online statement for information only. Errors, if any, must be reported to the Study Centre / Goa State Open School within the notified period. The original marksheet issued by Goa State Open School is final.
            </p>
          </div>
        </div>
      </div>
      <PrintFooter />
    </div>
    </FitCard>
  );
}
