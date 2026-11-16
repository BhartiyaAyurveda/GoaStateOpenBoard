// SAMPLE academic calendar events. Replace with the official academic calendar.
// date: ISO (YYYY-MM-DD). type decides the dot colour (see CAL_TYPES).
// Holiday dates marked "fixed" below are fixed-date public holidays; every other
// date (exam, admission, result) is a placeholder written for the design.

export const CAL_TYPES = {
  holiday: { label: "Holiday", dot: "#16a34a" },
  exam: { label: "Examination", dot: "#7c3aed" },
  admission: { label: "Admission", dot: "#1b57d8" },
  result: { label: "Result", dot: "#0d9488" },
};

export const CAL_EVENTS = [
  { date: "2026-08-15", title: "Independence Day", type: "holiday" }, // fixed
  { date: "2026-10-02", title: "Gandhi Jayanti", type: "holiday" }, // fixed
  { date: "2026-11-16", title: "Admission for session 2026–27 (Class X & XII) begins", type: "admission" },
  { date: "2026-12-07", title: "Public Examination – December 2026 begins", type: "exam" },
  { date: "2026-12-18", title: "Public Examination – December 2026 ends", type: "exam" },
  { date: "2026-12-19", title: "Goa Liberation Day", type: "holiday" }, // fixed
  { date: "2026-12-25", title: "Christmas", type: "holiday" }, // fixed
  { date: "2027-01-26", title: "Republic Day", type: "holiday" }, // fixed
  { date: "2027-01-29", title: "Declaration of results – December 2026 (tentative)", type: "result" },
  { date: "2027-03-01", title: "Public Examination – March 2027 begins (tentative)", type: "exam" },
];

export const pad = (n) => String(n).padStart(2, "0");
export const isoKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function eventsByDate() {
  const map = new Map();
  for (const e of CAL_EVENTS) {
    if (!map.has(e.date)) map.set(e.date, []);
    map.get(e.date).push(e);
  }
  return map;
}
