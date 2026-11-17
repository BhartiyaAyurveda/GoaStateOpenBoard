// Which of a course's subjects does ONE student take?
// English and the other subjects are compulsory; of the language OPTIONS (is_language_option) the student
// takes only the one chosen at registration (student_registrations.language_subject_id).
// A student with no valid choice (e.g. registered before this option existed) keeps all the options, so
// nothing disappears from an existing admit card or result.
export function subjectsForStudent(subjectRows = [], languageSubjectId = null) {
  const hasChoice = Boolean(languageSubjectId) && subjectRows.some((s) => s.id === languageSubjectId && s.is_language_option);
  return subjectRows.filter((s) => !s.is_language_option || !hasChoice || s.id === languageSubjectId);
}
