// Shared (client + server) constants for the result lookup.
// SAMPLE values – replace with the real examination sessions.

export const RESULT_CLASSES = [
  { value: "X", label: "Class X – Secondary", short: "Class X" },
  { value: "XII", label: "Class XII – Senior Secondary", short: "Class XII" },
];

// Public examinations are held twice a year (March and October).
// - From INDIVIDUAL_FROM_YEAR up to the latest one: every examination is listed separately, newest first.
// - Everything older, from ARCHIVE_FROM_YEAR to the year before INDIVIDUAL_FROM_YEAR: ONE combined
//   "old / backlog" option, so these results are looked up together.
const ARCHIVE_FROM_YEAR = 2019;
const INDIVIDUAL_FROM_YEAR = 2023;
const LATEST_EXAM = { year: 2026, month: 3 }; // update when a newer examination result is declared
const MONTH_NAMES = { 3: "March", 10: "October" };

function buildResultSessions() {
  const list = [];
  for (let y = LATEST_EXAM.year; y >= INDIVIDUAL_FROM_YEAR; y--) {
    for (const m of [10, 3]) {
      if (y === LATEST_EXAM.year && m > LATEST_EXAM.month) continue;
      list.push({ value: `${y}-${String(m).padStart(2, "0")}`, label: `Public Examination – ${MONTH_NAMES[m]} ${y}`, declared: true });
    }
  }
  list.push({
    value: `archive-${ARCHIVE_FROM_YEAR}-${INDIVIDUAL_FROM_YEAR - 1}`,
    label: `Old / Backlog Results – ${ARCHIVE_FROM_YEAR} to ${INDIVIDUAL_FROM_YEAR - 1} (all examinations)`,
    declared: true,
  });
  return list;
}

export const RESULT_SESSIONS = buildResultSessions();

export const ENROLLMENT_PATTERN = /^[A-Z0-9/-]{5,20}$/;
