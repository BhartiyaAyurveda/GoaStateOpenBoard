// SAMPLE notices written for the design. Replace with the real notices
// (title, date, category and, when available, the PDF link in `href`).
// `date` is ISO (YYYY-MM-DD). `isNew` shows the blinking NEW badge.
// href: a path inside /public (e.g. "/notices/xyz.pdf") or an internal page.

export const NOTICE_CATEGORIES = ["Admission", "Examination", "Study Centres", "General"];

export const SAMPLE_NOTICES = [
  { text: "Admission for Academic Session 2026–27 (Class X & XII)", date: "2026-11-16", cat: "Admission", isNew: true, href: "/programmes/class-x" },
  { text: "Revised Schedule for Public Examination – Dec 2026", date: "2026-11-10", cat: "Examination", isNew: true },
  { text: "Guidelines for Submission of TMA", date: "2026-11-05", cat: "Examination", isNew: true },
  { text: "List of Accredited Study Centres for 2026–27", date: "2026-10-28", cat: "Study Centres", isNew: false },
  { text: "Date Extension for Submission of Examination Forms", date: "2026-10-22", cat: "Examination", isNew: false },
  { text: "Notice Regarding Re-evaluation of Answer Scripts", date: "2026-10-18", cat: "Examination", isNew: false },
  { text: "Schedule for Practical Examinations 2026–27", date: "2026-10-12", cat: "Examination", isNew: false },
  { text: "Admission Forms for Class X and XII Now Available", date: "2026-10-05", cat: "Admission", isNew: false, href: "/forms/Admission-Form-Class-X.pdf" },
  { text: "Affiliation of New Study Centres – Invitation of Applications", date: "2026-09-26", cat: "Study Centres", isNew: false, href: "/forms/Affiliation-Form.pdf" },
  { text: "Syllabus and Scheme of Studies for Session 2026–27", date: "2026-09-18", cat: "General", isNew: false, href: "/downloads/Syllabus-2026-27.pdf" },
  { text: "Last Date for Admission to Class X and XII (Session 2026–27)", date: "2026-09-10", cat: "Admission", isNew: false },
  { text: "Holiday List for the Year 2026", date: "2026-08-14", cat: "General", isNew: false },
  { text: "Declaration of Results – Public Examination March 2026", date: "2026-06-12", cat: "Examination", isNew: false, href: "/result" },
  { text: "Admit Cards for Public Examination March 2026", date: "2026-02-20", cat: "Examination", isNew: false, href: "/admit-card" },
  { text: "Schedule of Public Examination – March 2026", date: "2026-01-15", cat: "Examination", isNew: false },
  { text: "Admission for Academic Session 2025–26", date: "2025-08-04", cat: "Admission", isNew: false },
  { text: "Results – Public Examination October 2025", date: "2025-12-18", cat: "Examination", isNew: false },
  { text: "Guidelines for Contact Classes at Study Centres", date: "2025-07-21", cat: "Study Centres", isNew: false },
].sort((a, b) => (a.date < b.date ? 1 : -1));

export const formatNoticeDate = (iso) => {
  const [y, m, d] = iso.split("-");
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1];
  return `${d} ${mon} ${y}`;
};

// Used while the dashboard has no published announcements yet.
export const NOTICES = SAMPLE_NOTICES;
