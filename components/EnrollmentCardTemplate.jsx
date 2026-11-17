"use client";

import Image from "next/image";

// Student Enrollment Card (A4). Same look as the Admit Card and the Statement of Marks:
// header band, stripe, title bar, candidate box with photo, enrolled subjects, validity, authorisation.
// data = { candidate, centre, subjects, photoUrl?, sample? }

const NAVY = "#0B1E36";
const NAVY_2 = "#132E52";
const BRAND = "#1b57d8";
const BRAND_DARK = "#1245b8";
const SKY = "#8ec9fa";

const fmtDate = (iso) => {
  if (!iso) return "—";
  const p = String(iso).split("-");
  return p.length === 3 && p[0].length === 4 ? `${p[2]}-${p[1]}-${p[0]}` : iso;
};

function SectionBar({ children }) {
  return (
    <div style={{ background: `linear-gradient(90deg,${NAVY},${NAVY_2})` }} className="flex items-center gap-2 px-4 py-1.5">
      <span style={{ width: 3, height: 14, background: BRAND, borderRadius: 2, flexShrink: 0, display: "inline-block" }} />
      <span className="text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-white">{children}</span>
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div className="flex items-start gap-2 px-4 py-[5px]">
      <span style={{ color: "#64748b", fontSize: 9.5, fontWeight: 600, minWidth: 96, flexShrink: 0, marginTop: 1 }}>{label}</span>
      <span style={{ color: "#94a3b8", fontSize: 10, marginTop: 1 }}>:</span>
      <span style={{ color: NAVY, fontSize: bold ? 11.5 : 10.5, fontWeight: 700, fontFamily: mono ? "monospace" : undefined, letterSpacing: mono ? "0.05em" : undefined, lineHeight: 1.4 }}>{value || "—"}</span>
    </div>
  );
}

function Signature({ title, sub, width = 190 }) {
  return (
    <div style={{ width, maxWidth: "100%", textAlign: "center" }}>
      <div style={{ height: 44, borderBottom: "1.5px solid #94a3b8", marginBottom: 6, marginLeft: 8, marginRight: 8, position: "relative" }}>
        <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: BRAND }} />
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, color: NAVY, letterSpacing: "0.03em" }}>{title}</div>
      <div style={{ fontSize: 8.5, color: "#64748b", fontWeight: 600, marginTop: 1 }}>{sub}</div>
    </div>
  );
}

export default function EnrollmentCardTemplate({ data }) {
  if (!data) return null;
  const { candidate: c, centre = {}, subjects = [], photoUrl, sample } = data;
  // keep one A4 page whatever the number of subjects: shrink a little when there are more than 6
  const printZoom = subjects.length <= 6 ? 1 : subjects.length === 7 ? 0.96 : subjects.length === 8 ? 0.92 : 0.88;

  return (
    <div className="enrollment-card-wrapper mx-auto w-full max-w-[860px] font-sans text-[#0F172A] shadow-2xl print:shadow-none">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm 8mm 6mm 8mm; }
          html, body { background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; }
          .enrollment-card-wrapper { width: calc(194mm / ${printZoom}) !important; max-width: calc(194mm / ${printZoom}) !important; margin: 0 auto !important; zoom: ${printZoom} !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="relative overflow-hidden bg-white" style={{ border: `2px solid ${NAVY}` }}>
        {/* watermark logo */}
        <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center overflow-hidden" aria-hidden="true">
          <Image src="/images/logo.png" alt="" width={360} height={200} style={{ width: 360, height: "auto", opacity: 0.08, objectFit: "contain" }} />
        </div>
        {sample && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden" aria-hidden="true">
            <span className="-rotate-[28deg] select-none text-[96px] font-black uppercase tracking-widest text-[#e0242b]/15 sm:text-[120px]">Sample</span>
          </div>
        )}

        <div className="relative z-10">
          {/* header band */}
          <div style={{ background: "linear-gradient(135deg,#071527 0%,#0B1E36 40%,#132E52 100%)" }} className="flex items-center gap-4 px-5 py-4 print:py-3">
            <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-full bg-white" style={{ border: `2.5px solid ${BRAND}`, boxShadow: `0 0 0 4px ${BRAND}30, 0 4px 16px #00000060` }}>
              <Image src="/images/logo.png" alt="Goa State Open School logo" width={78} height={44} style={{ width: 70, height: "auto", objectFit: "contain" }} />
            </div>
            <div className="flex-1 text-center">
              <div lang="kok" className="font-devanagari text-[18px] font-extrabold leading-tight tracking-wide sm:text-[20px]" style={{ color: SKY }}>
                गोंय राज्य मुक्त शाळा
              </div>
              <h1 className="mt-1 text-[12px] font-bold uppercase leading-tight tracking-[0.16em] text-white sm:text-[13px]">Goa State Open School</h1>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <div className="h-px max-w-[80px] flex-1" style={{ background: `linear-gradient(90deg,transparent,${BRAND})` }} />
                <span className="whitespace-nowrap px-1 text-[8.5px] font-medium tracking-wider text-[#A2B7CF]">Open schooling &nbsp;✦&nbsp; Flexible learning &nbsp;✦&nbsp; Second chance education</span>
                <div className="h-px max-w-[80px] flex-1" style={{ background: `linear-gradient(90deg,${BRAND},transparent)` }} />
              </div>
            </div>
            <div className="hidden w-[76px] shrink-0 sm:block" />
          </div>

          <div style={{ height: 4, background: `linear-gradient(90deg,${BRAND_DARK},${BRAND},${SKY},${BRAND},${BRAND_DARK})` }} />

          {/* title */}
          <div style={{ background: "linear-gradient(180deg,#F5F8FB,#EBF1F7)" }} className="border-b border-[#D0DCE7] px-6 py-2.5 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg,transparent,${BRAND})` }} />
              <div>
                <div className="text-[13px] font-extrabold uppercase tracking-[0.2em]" style={{ color: NAVY }}>
                  Student Enrollment Card &nbsp;/&nbsp; <span lang="kok" className="font-devanagari normal-case tracking-normal">नोंदणी पत्र</span>
                </div>
                <div className="mt-0.5 text-[9.5px] font-semibold tracking-wider" style={{ color: BRAND_DARK }}>
                  {c.session ? `Academic Session ${c.session}  •  ` : ""}{c.programme}
                </div>
              </div>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg,${BRAND},transparent)` }} />
            </div>
          </div>

          {sample && (
            <p className="border-b border-[#e0242b]/30 bg-[#fff1f1] px-5 py-1.5 text-center text-[11px] font-bold text-[#b4161c]">
              SAMPLE ENROLLMENT CARD FOR DESIGN REVIEW &ndash; NOT A REAL CARD
            </p>
          )}

          <div className="space-y-3 px-5 pb-8 pt-4 sm:px-6 print:space-y-2 print:px-4 print:pb-4 print:pt-3">
            {/* enrollment number */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3" style={{ border: `1.5px solid ${BRAND}`, borderRadius: 6, background: "linear-gradient(135deg,#f4f8fe,#e3edfa)" }}>
              <div>
                <div style={{ fontSize: 8.5, color: BRAND_DARK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em" }}>Enrollment Number</div>
                <div style={{ fontSize: 9.5, color: "#64748b", fontWeight: 600, marginTop: 2 }}>Keep it safe - needed for the Admit Card and Result</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: NAVY, fontFamily: "monospace", letterSpacing: "0.12em", lineHeight: 1 }}>{c.enrollment}</div>
            </div>

            {/* candidate + photo */}
            <div className="overflow-hidden bg-white" style={{ border: `1px solid ${BRAND}`, borderRadius: 4 }}>
              <SectionBar>Candidate Particulars</SectionBar>
              <div className="flex items-stretch">
                <div className="min-w-0 flex-1">
                  {[
                    [["Candidate Name", c.name?.toUpperCase(), true], ["Date of Birth", fmtDate(c.dob)]],
                    [["Father's Name", c.father?.toUpperCase()], ["Gender", c.gender]],
                    [["Mother's Name", c.mother?.toUpperCase()], ["Category", c.category]],
                  ].map((row, ri) => (
                    <div key={ri} className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2" style={{ borderBottom: "1px dashed #E2E8F0" }}>
                      {row.map(([label, val, bold, mono]) => (
                        <Row key={label} label={label} value={val} bold={bold} mono={mono} />
                      ))}
                    </div>
                  ))}
                  <div style={{ borderBottom: "1px dashed #E2E8F0" }}>
                    <Row label="Programme" value={c.programme?.toUpperCase()} />
                  </div>
                  <Row label="Study Centre" value={`${centre.name || ""}${centre.address ? `, ${centre.address}` : ""}`.toUpperCase()} />
                </div>

                <div className="flex w-[96px] shrink-0 flex-col items-center justify-center gap-1 p-2" style={{ borderLeft: "1px dashed #E2E8F0", background: "#F8FAFC" }}>
                  <div style={{ border: `2px solid ${NAVY}`, width: 78, height: 100, overflow: "hidden", background: "#F1F5F9", position: "relative", boxShadow: "2px 2px 6px #0003" }}>
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-center" style={{ fontSize: 7.5, fontWeight: 700, color: `${NAVY}99`, textTransform: "uppercase", lineHeight: 1.4, padding: 6 }}>
                        Affix<br />passport<br />photo
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 7.5, color: "#64748b", textAlign: "center" }}>Passport Size</div>
                </div>
              </div>
            </div>

            {/* subjects */}
            <div className="overflow-hidden bg-white" style={{ border: `1px solid ${BRAND}`, borderRadius: 4 }}>
              <SectionBar>Subjects Enrolled For / <span lang="kok" className="font-devanagari normal-case tracking-normal">नोंदणी केल्ले विशय</span></SectionBar>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr style={{ background: NAVY }} className="text-white">
                    <th className="border-r border-white/10 px-2 py-2.5 text-center font-bold uppercase tracking-wide print:py-2" style={{ width: "10%", fontSize: 10.5 }}>S.No.</th>
                    <th className="border-r border-white/10 px-3 py-2.5 text-center font-bold uppercase tracking-wide print:py-2" style={{ width: "20%", fontSize: 10.5 }}>Subject Code</th>
                    <th className="px-3 py-2.5 font-bold uppercase tracking-wide print:py-2" style={{ fontSize: 10.5 }}>Subject Name</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <tr key={`${s.code}-${i}`} style={{ background: i % 2 === 0 ? "#ffffff" : "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <td className="border-r border-slate-200 px-2 py-2 text-center font-bold print:py-1.5" style={{ color: BRAND_DARK, fontSize: 11 }}>{i + 1}</td>
                      <td className="border-r border-slate-200 px-3 py-2 text-center font-mono font-extrabold print:py-1.5" style={{ color: BRAND_DARK, fontSize: 10.5 }}>{s.code || "—"}</td>
                      <td className="px-3 py-2 print:py-1.5" style={{ fontWeight: 700, color: NAVY, fontSize: 11.5 }}>{s.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* validity */}
            <div className="grid grid-cols-2 gap-2.5">
              {[["Date of Enrollment", c.enrolledOn], ["Valid Till", c.validTill]].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ border: `1.5px solid ${BRAND}`, borderRadius: 6, background: "linear-gradient(135deg,#f4f8fe,#e3edfa)" }}>
                  <span style={{ fontSize: 8.5, color: BRAND_DARK, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: NAVY, fontFamily: "monospace" }}>{fmtDate(val)}</span>
                </div>
              ))}
            </div>

            {/* authorisation */}
            <div style={{ border: `1px solid ${BRAND}`, borderRadius: 4, overflow: "hidden" }}>
              <SectionBar>Authorisation &amp; Verification</SectionBar>
              <div className="flex flex-wrap items-center justify-around gap-6 px-6 py-3" style={{ background: "linear-gradient(180deg,#ffffff,#F8FAFC)" }}>
                <Signature title="Signature of the Candidate" sub="(Enrolled learner)" />
                <Signature title="Study Centre Coordinator" sub="(With centre seal)" />
                <Signature title="Authorised Signatory" sub="Goa State Open School" />
              </div>
            </div>

            <p className="rounded-[4px] border border-dashed border-[#E5C766] bg-[#fff8e6] px-4 py-2 text-center text-[10px] font-medium leading-relaxed text-[#5a4300]">
              <b>Note:</b> Keep this enrollment card safe. The Enrollment Number is required for the Admit Card, Result and all other correspondence with Goa State Open School. Report any error to the Study Centre immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
