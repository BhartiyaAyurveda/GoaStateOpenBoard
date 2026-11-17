"use client";

function fmtDate(d) {
  if (!d) return "—";
  const p = d.split("-");
  if (p.length === 3 && p[0].length === 4)
    return `${p[2].padStart(2, "0")}-${p[1].padStart(2, "0")}-${p[0]}`;
  return d;
}

function fmtExamDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function AdmitCardTemplate({ data, showPageBreak = false }) {
  if (!data) return null;

  const subjects = data.subjects || [];
  // keep one A4 page whatever the number of subjects: shrink a little when there are more than 6
  const printZoom = subjects.length <= 6 ? 1 : subjects.length === 7 ? 0.95 : subjects.length === 8 ? 0.91 : 0.87;

  return (
    <div
      className="result-marksheet-wrapper w-full max-w-[860px] mx-auto font-sans text-[#0F172A] shadow-2xl print:shadow-none"
      style={{
        pageBreakAfter: showPageBreak ? "always" : "auto",
        breakAfter: showPageBreak ? "page" : "auto",
      }}
    >
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body {
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print { display: none !important; }
          .result-marksheet-wrapper {
            width: calc(192mm / ${printZoom}) !important;
            max-width: calc(192mm / ${printZoom}) !important;
            zoom: ${printZoom} !important;
            margin: 10mm auto 0 auto !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: ${showPageBreak ? "always !important" : "auto !important"};
            break-after: ${showPageBreak ? "page !important" : "auto !important"};
          }
        }
      `}</style>

      {/* ── CLEAN ACADEMIC SINGLE SOLID BORDER (EXACT RESULT TEMPLATE STYLE) ── */}
      <div className="relative bg-white overflow-hidden" style={{ border: "2px solid #0B1E36" }}>
        {/* Watermark */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
          style={{ zIndex: 20 }}
          aria-hidden="true"
        >
          <img
            src="/images/logo.png"
            alt=""
            style={{ width: 360, height: 360, objectFit: "contain", opacity: 0.1 }}
          />
        </div>

        <div className="relative z-10">
          {/* ── 1. HEADER BAND ── */}
          <div
            style={{ background: "linear-gradient(135deg, #071527 0%, #0B1E36 40%, #132E52 100%)" }}
            className="px-5 py-4 flex items-center gap-4"
          >
            {/* Left logo */}
            <div
              className="shrink-0 w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center shadow-xl"
              style={{
                border: "2.5px solid #1b57d8",
                boxShadow: "0 0 0 4px #1b57d830, 0 4px 16px #00000060",
              }}
            >
              <img
                src="/images/logo.png"
                alt="Goa State Open School logo"
                style={{ width: 78, height: 78, objectFit: "contain" }}
              />
            </div>

            {/* Center text */}
            <div className="flex-1 text-center">
              <div
                className="text-[#5db0f4] text-[18px] sm:text-[20px] font-extrabold tracking-wide leading-tight"
                lang="kok"
                style={{ fontFamily: "var(--font-noto-deva), 'Noto Sans Devanagari', sans-serif" }}
              >
                गोंय राज्य मुक्त शाळा
              </div>
              <h1 className="text-white text-[12px] sm:text-[13px] font-bold tracking-[0.16em] uppercase leading-tight mt-1">
                Goa State Open School
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <div
                  className="h-px flex-1 max-w-[80px]"
                  style={{ background: "linear-gradient(90deg, transparent, #1b57d8)" }}
                />
                <span className="text-[#A2B7CF] text-[8.5px] font-medium tracking-wider whitespace-nowrap px-1">
                  Open schooling &nbsp;✦&nbsp; Flexible learning &nbsp;✦&nbsp; Examination Division
                </span>
                <div
                  className="h-px flex-1 max-w-[80px]"
                  style={{ background: "linear-gradient(90deg, #1b57d8, transparent)" }}
                />
              </div>
            </div>

            {/* Right spacer */}
            <div className="shrink-0 w-[76px] hidden sm:block" />
          </div>

          {/* Gold stripe */}
          <div
            style={{
              height: 4,
              background: "linear-gradient(90deg, #1245b8, #1b57d8, #5db0f4, #1b57d8, #1245b8)",
            }}
          />

          {/* ── 2. DOCUMENT TITLE ── */}
          <div
            style={{ background: "linear-gradient(180deg, #F5F8FB, #EBF1F7)" }}
            className="py-2.5 px-6 text-center border-b border-[#D0DCE7]"
          >
            <div className="flex items-center justify-center gap-3">
              <div
                className="h-px flex-1"
                style={{ background: "linear-gradient(90deg, transparent, #1b57d8)" }}
              />
              <div>
                <div className="text-[#0B1E36] font-extrabold text-[13px] tracking-[0.2em] uppercase">
                  Examination Hall Ticket &nbsp;/&nbsp; प्रवेश पत्र
                </div>
                <div className="text-[#1245b8] text-[9.5px] font-semibold tracking-wider mt-0.5">
                  {data.session_label || "Annual Examination"}
                </div>
              </div>
              <div
                className="h-px flex-1"
                style={{ background: "linear-gradient(90deg, #1b57d8, transparent)" }}
              />
            </div>
          </div>

          {/* ── 3. BODY CONTENT (SPACE-Y-3 EXACT RESULT STYLE) ── */}
          <div className="px-5 sm:px-6 pt-4 pb-6 print:px-4 print:pt-3 print:pb-4 space-y-3">
            {/* ── CANDIDATE DETAILS + PHOTO ── */}
            <div
              className="overflow-hidden bg-white"
              style={{ border: "1px solid #1b57d8", borderRadius: 4 }}
            >
              <div
                style={{ background: "linear-gradient(90deg, #0B1E36, #132E52)" }}
                className="px-4 py-1.5 flex items-center gap-2"
              >
                <span
                  style={{
                    width: 3,
                    height: 14,
                    background: "#1b57d8",
                    borderRadius: 2,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span className="text-[9.5px] font-extrabold text-white uppercase tracking-[0.15em]">
                  Candidate &amp; Examination Particulars / उमेदवार तपशील
                </span>
              </div>
              <div className="flex items-stretch">
                <div className="flex-1 divide-y divide-dashed" style={{ borderColor: "#E2E8F0" }}>
                  {[
                    [["Candidate Name", (data.candidate_name || "—").toUpperCase(), true], ["Roll Number", data.roll_no || "—", true, true]],
                    [["Father's Name", (data.father_name || "—").toUpperCase()], ["Enrollment No.", data.enrollment_no || "—", false, true]],
                    [["Date of Birth", fmtDate(data.dob)], ["Exam Year", data.exam_year_label || "1st Year"]],
                  ].map((row, ri) => (
                    <div
                      key={ri}
                      className="grid grid-cols-2"
                      style={{ borderBottom: "1px dashed #E2E8F0" }}
                    >
                      {row.map(([label, val, bold, mono]) => (
                        <div
                          key={label}
                          className="flex items-center gap-2 px-4 py-[5.5px]"
                          style={{
                            borderRight:
                              row.indexOf([label, val, bold, mono]) === 0
                                ? "1px dashed #E2E8F0"
                                : undefined,
                          }}
                        >
                          <span
                            style={{
                              color: "#64748b",
                              fontSize: 9.5,
                              fontWeight: 600,
                              minWidth: 96,
                              flexShrink: 0,
                            }}
                          >
                            {label}
                          </span>
                          <span style={{ color: "#94a3b8", fontSize: 10 }}>:</span>
                          <span
                            style={{
                              color: "#0B1E36",
                              fontSize: bold ? 11.5 : 10.5,
                              fontWeight: 700,
                              fontFamily: mono ? "monospace" : undefined,
                              letterSpacing: mono ? "0.05em" : undefined,
                            }}
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div
                    className="flex items-start gap-2 px-4 py-[5.5px]"
                    style={{ borderBottom: "1px dashed #E2E8F0" }}
                  >
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: 9.5,
                        fontWeight: 600,
                        minWidth: 96,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      Programme / Course
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 10, marginTop: 1 }}>:</span>
                    <span
                      style={{
                        color: "#0B1E36",
                        fontSize: 10.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        lineHeight: 1.4,
                      }}
                    >
                      {data.course || "—"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 px-4 py-[5.5px]">
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: 9.5,
                        fontWeight: 600,
                        minWidth: 96,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      Examination Centre
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: 10, marginTop: 1 }}>:</span>
                    <span
                      style={{
                        color: "#0B1E36",
                        fontSize: 10.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        lineHeight: 1.4,
                      }}
                    >
                      {data.center_name || "Central Examination Centre"}
                    </span>
                  </div>
                </div>

                {/* Photo */}
                <div
                  className="shrink-0 w-[96px] flex flex-col items-center justify-center gap-1 p-2"
                  style={{ borderLeft: "1px dashed #E2E8F0", background: "#F8FAFC" }}
                >
                  <div
                    style={{
                      border: "2px solid #0B1E36",
                      width: 78,
                      height: 100,
                      overflow: "hidden",
                      background: "#F1F5F9",
                      position: "relative",
                      boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {data.photo_url ? (
                      <img
                        src={data.photo_url}
                        alt="Photo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: 8.5,
                          color: "#64748b",
                          textAlign: "center",
                          padding: 4,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          textTransform: "uppercase",
                        }}
                      >
                        Affix
                        <br />
                        Passport
                        <br />
                        Photo
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 7.5, color: "#64748b", textAlign: "center" }}>
                    Passport Size
                  </div>
                </div>
              </div>
            </div>

            {/* ── EXAMINATION SCHEDULE TABLE ── */}
            <div
              className="overflow-hidden bg-white"
              style={{ border: "1px solid #1b57d8", borderRadius: 4 }}
            >
              <div
                style={{ background: "linear-gradient(90deg, #0B1E36, #132E52)" }}
                className="px-4 py-1.5 flex items-center gap-2"
              >
                <span
                  style={{
                    width: 3,
                    height: 14,
                    background: "#1b57d8",
                    borderRadius: 2,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span className="text-[9.5px] font-extrabold text-white uppercase tracking-[0.15em]">
                  Examination Schedule / परिक्षा वेळापत्रक
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr style={{ background: "#0B1E36" }} className="text-white">
                      <th
                        className="py-2.5 px-2 text-center font-bold uppercase tracking-wide border-r border-white/10"
                        style={{ width: "6%", fontSize: 10.5 }}
                      >
                        S.No.
                      </th>
                      <th
                        className="py-2.5 px-3 text-center font-bold uppercase tracking-wide border-r border-white/10"
                        style={{ width: "13%", fontSize: 10.5 }}
                      >
                        Subject Code
                      </th>
                      <th
                        className="py-2.5 px-3 font-bold uppercase tracking-wide border-r border-white/10"
                        style={{ width: "36%", fontSize: 10.5 }}
                      >
                        Subject Name
                      </th>
                      <th
                        className="py-2.5 px-3 text-center font-bold uppercase tracking-wide border-r border-white/10"
                        style={{ width: "18%", fontSize: 10.5 }}
                      >
                        Exam Date
                      </th>
                      <th
                        className="py-2.5 px-3 text-center font-bold uppercase tracking-wide"
                        style={{ width: "27%", fontSize: 10.5 }}
                      >
                        Shift / Timing
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length > 0 ? (
                      subjects.map((sub, idx) => (
                        <tr
                          key={sub.subject_code || idx}
                          style={{
                            background: idx % 2 === 0 ? "#ffffff" : "#F8FAFC",
                            borderBottom: "1px solid #E2E8F0",
                          }}
                        >
                          <td
                            className="py-2 print:py-1.5 px-2 text-center font-bold border-r border-slate-200"
                            style={{ color: "#1245b8", fontSize: 11 }}
                          >
                            {idx + 1}
                          </td>
                          <td
                            className="py-2 print:py-1.5 px-3 text-center font-mono font-extrabold border-r border-slate-200"
                            style={{ color: "#1245b8", fontSize: 10.5 }}
                          >
                            {sub.subject_code || "—"}
                          </td>
                          <td
                            className="py-2 print:py-1.5 px-3 border-r border-slate-200"
                            style={{ fontWeight: 700, color: "#0B1E36", fontSize: 11.5 }}
                          >
                            {sub.subject_name}
                          </td>
                          <td
                            className="py-2 print:py-1.5 px-3 text-center border-r border-slate-200"
                            style={{
                              color: "#0B1E36",
                              fontWeight: 700,
                              fontSize: 11,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtExamDate(sub.exam_date)}
                          </td>
                          <td
                            className="py-2 print:py-1.5 px-3 text-center"
                            style={{ color: "#475569", fontWeight: 600, fontSize: 10.5, whiteSpace: "nowrap" }}
                          >
                            {sub.exam_time || "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 text-center text-slate-400 italic text-[11px]"
                        >
                          Examination schedule will be updated shortly.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── IMPORTANT INSTRUCTIONS (BILINGUAL) ── */}
            <div
              className="overflow-hidden bg-white"
              style={{ border: "1px solid #1b57d8", borderRadius: 4 }}
            >
              <div
                style={{ background: "linear-gradient(90deg, #0B1E36, #132E52)" }}
                className="px-4 py-1.5 flex items-center gap-2"
              >
                <span
                  style={{
                    width: 3,
                    height: 14,
                    background: "#1b57d8",
                    borderRadius: 2,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span className="text-[9.5px] font-extrabold text-white uppercase tracking-[0.15em]">
                  Important Instructions / म्हत्वाच्यो सूचना
                </span>
              </div>
              <div className="grid grid-cols-2 bg-[#ffffff]">
                <div className="p-3 border-r border-dashed border-[#E2E8F0]">
                  {[
                    "This Admit Card must be produced at the exam centre along with valid Govt. Photo ID.",
                    "Report at the examination centre at least 30 minutes before scheduled start time.",
                    "Only Blue/Black ballpoint pens are permitted. Mobile phones & gadgets strictly prohibited.",
                    "Admission is provisional; any malpractice will lead to immediate cancellation.",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 mb-1.5 last:mb-0 text-[9.5px] text-slate-600 leading-relaxed"
                    >
                      <span className="font-extrabold text-[#1b57d8] shrink-0">{idx + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 font-devanagari">
                  {[
                    "ह्या प्रवेशपत्राभाशेन मान्य सरकारी फोटो ओळखपत्र (आधार / पॅन) हाडप सक्तीचें आसा.",
                    "परिक्षा सुरू जावपाच्या कमींत कमी 30 मिनटां आदीं परिक्षा केंद्रार हाजीर रावप गरजेचें आसा.",
                    "फकत निळो/काळो बॉल पेन वापरपाक परवानगी आसा. मोबाइल फोन आनी इलेक्ट्रॉनिक साधनां पुरायपणान निशिद्ध.",
                    "प्रवेश पुरायपणान तात्पुरतो आसा; कसल्याय अयोग्य मार्गाचो वापर केल्यार उमेदवारी रद्द जातली.",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 mb-1.5 last:mb-0 text-[9.5px] text-slate-600 leading-relaxed"
                    >
                      <span className="font-extrabold text-[#1b57d8] shrink-0">{idx + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 4. SIGNATURES & VERIFICATION (EXACT RESULT MARKSHEET STYLE) ── */}
            <div
              className="overflow-hidden"
              style={{ border: "1px solid #1b57d8", borderRadius: 4 }}
            >
              {/* Top label bar */}
              <div
                style={{ background: "linear-gradient(90deg, #0B1E36, #132E52)" }}
                className="px-4 py-1.5 flex items-center gap-2"
              >
                <span
                  style={{
                    width: 3,
                    height: 14,
                    background: "#1b57d8",
                    borderRadius: 2,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span className="text-[9.5px] font-extrabold text-white uppercase tracking-[0.15em]">
                  Authorisation &amp; Verification / प्राधिकृत पडताळणी
                </span>
              </div>

              <div
                style={{ background: "linear-gradient(180deg, #ffffff, #F8FAFC)" }}
                className="px-6 py-4 flex items-end justify-between gap-6"
              >
                {/* Candidate Signature */}
                <div className="flex-1 text-center">
                  <div
                    style={{
                      height: 44,
                      borderBottom: "1.5px solid #94a3b8",
                      marginBottom: 6,
                      marginLeft: 8,
                      marginRight: 8,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: -3,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#1b57d8",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: "#0B1E36" }}>
                    Signature of Candidate
                  </div>
                  <div style={{ fontSize: 8, color: "#64748b", marginTop: 1 }}>
                    (In presence of Invigilator)
                  </div>
                </div>

                {/* Center Seal */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: "50%",
                      border: "2.5px solid #0B1E36",
                      background: "radial-gradient(circle at 40% 35%, #ffffff 60%, #F1F5F9)",
                      boxShadow:
                        "0 0 0 2px #1b57d8, 0 0 0 4px rgba(197, 155, 63, 0.25), 0 3px 12px rgba(11, 30, 54, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 5,
                        borderRadius: "50%",
                        border: "1.2px dashed rgba(11, 30, 54, 0.5)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 9,
                        borderRadius: "50%",
                        border: "0.5px dotted rgba(197, 155, 63, 0.7)",
                      }}
                    />
                    <img
                      src="/images/logo.png"
                      alt=""
                      style={{
                        width: 38,
                        height: 38,
                        objectFit: "contain",
                        position: "relative",
                        zIndex: 1,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: 8.5,
                        fontWeight: 800,
                        color: "#0B1E36",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Official Seal
                    </div>
                    <div style={{ fontSize: 7, color: "#1245b8", fontWeight: 700 }}>
                      GOA STATE OPEN SCHOOL
                    </div>
                  </div>
                </div>

                {/* Principal Signature */}
                <div className="flex-1 text-center">
                  <div
                    style={{
                      height: 44,
                      borderBottom: "1.5px solid #94a3b8",
                      marginBottom: 6,
                      marginLeft: 8,
                      marginRight: 8,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: -3,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#1b57d8",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: "#0B1E36" }}>
                    Signature of Principal
                  </div>
                  <div style={{ fontSize: 8, color: "#64748b", marginTop: 1 }}>
                    (With College Seal)
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. FOOTER DISCLAIMER BAR ── */}
            <div>
              <div
                style={{
                  height: 3,
                  background:
                    "linear-gradient(90deg, #1245b8, #1b57d8, #5db0f4, #1b57d8, #1245b8)",
                }}
              />
              <div className="text-center py-1 text-[8px] text-[#64748b] tracking-wide">
                Official Computer-generated Examination Hall Ticket ✦ No manual signature required ✦ हें संगणकान तयार केल्लें अधिकृत प्रवेशपत्र आसा
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
