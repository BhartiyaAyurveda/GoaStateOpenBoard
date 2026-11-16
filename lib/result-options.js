// Shared (client + server) constants for the result lookup.
// SAMPLE values – replace with the real examination sessions.

export const RESULT_CLASSES = [
  { value: "X", label: "Class X – Secondary", short: "Class X" },
  { value: "XII", label: "Class XII – Senior Secondary", short: "Class XII" },
];

export const RESULT_SESSIONS = [
  { value: "2026-03", label: "Public Examination – March 2026", declared: true },
  { value: "2025-10", label: "Public Examination – October 2025", declared: true },
];

export const ENROLLMENT_PATTERN = /^[A-Z0-9/-]{5,20}$/;
