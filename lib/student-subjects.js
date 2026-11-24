import { supabaseAdmin } from "@/lib/supabase";

// Which of a course's subjects does ONE student take?
//
// 1. If the Board has ticked specific subjects for the student (student_registrations.selected_subject_ids),
//    ONLY those subjects count (admit card, result, marks entry, enrollment card). The selection holds
//    subject ids; ids from other years are ignored, and if none of them belong to the subjects being
//    looked at (e.g. a year the Board has not ticked anything for), that year keeps all its subjects.
// 2. Otherwise: English and the other subjects are compulsory; of the language OPTIONS (is_language_option)
//    the student takes only the one chosen at registration (student_registrations.language_subject_id).
//    A student with no valid choice keeps all the options, so nothing disappears from an existing
//    admit card or result.
export function subjectsForStudent(subjectRows = [], languageSubjectId = null, selectedIds = null) {
  if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    const picked = new Set(selectedIds);
    const chosen = subjectRows.filter((s) => picked.has(s.id));
    if (chosen.length > 0) return chosen;
  }
  const hasChoice = Boolean(languageSubjectId) && subjectRows.some((s) => s.id === languageSubjectId && s.is_language_option);
  return subjectRows.filter((s) => !s.is_language_option || !hasChoice || s.id === languageSubjectId);
}

// SERVER-ONLY. Reads the Board's subject selection for a student. It is a separate, error-tolerant query
// (not part of the big registration select) so that if the column has not been added to the database yet,
// admit cards and results keep working exactly as before instead of failing.
export async function loadSelectedSubjectIds(registrationId) {
  try {
    const { data, error } = await supabaseAdmin
      .from("student_registrations")
      .select("selected_subject_ids")
      .eq("id", registrationId)
      .maybeSingle();
    if (error || !data || !Array.isArray(data.selected_subject_ids)) return null;
    return data.selected_subject_ids;
  } catch {
    return null;
  }
}
