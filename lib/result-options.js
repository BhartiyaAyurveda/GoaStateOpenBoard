// Shared (client + server) constants for the result lookup.
// SAMPLE values – replace with the real examination sessions.

export const RESULT_CLASSES = [
  { value: "X", label: "Class X – Secondary", short: "Class X" },
  { value: "XII", label: "Class XII – Senior Secondary", short: "Class XII" },
];

// Public examinations are held twice a year (March and October). Listed from 2020 up to the latest one,
// newest first, so results of older sessions can be looked up too.
const FIRST_EXAM_YEAR = 2020;
const LATEST_EXAM = { year: 2026, month: 3 }; // update when a newer examination result is declared
const MONTH_NAMES = { 3: "March", 10: "October" };

function buildResultSessions() {
  const list = [];
  for (let y = LATEST_EXAM.year; y >= FIRST_EXAM_YEAR; y--) {
    for (const m of [10, 3]) {
      if (y === LATEST_EXAM.year && m > LATEST_EXAM.month) continue;
      list.push({ value: `${y}-${String(m).padStart(2, "0")}`, label: `Public Examination – ${MONTH_NAMES[m]} ${y}`, declared: true });
    }
  }
  return list;
}

export const RESULT_SESSIONS = buildResultSessions();

export const ENROLLMENT_PATTERN = /^[A-Z0-9/-]{5,20}$/;
