// SERVER-ONLY result lookup for the public Result page. Never import from a client component.
//
// Reads the results published from the Board dashboard (Exam Management → Results).
// A result is only returned when BOTH the enrollment number and the date of birth match
// a student whose registration is approved AND whose result has been published, so
// results cannot be enumerated by enrollment number alone.
import { supabaseAdmin } from "@/lib/supabase";
import { getResultData } from "@/lib/result-data";

export function resultsAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

export async function findResult({ cls, session, enrollment, dob }) {
  const { data: reg } = await supabaseAdmin
    .from("student_registrations")
    .select("id, courses(course_code)")
    .eq("enrollment_no", enrollment)
    .eq("dob", dob)
    .eq("status", "approved")
    .not("result_published_at", "is", null)
    .maybeSingle();

  if (!reg || reg.courses?.course_code !== cls) return null;

  const { data: r } = await getResultData(reg.id, 1);
  if (!r || !r.is_published || r.final_result === "INCOMPLETE") return null;

  const subjects = r.subjects.map((s) => ({
    code: s.subject_code || "",
    name: s.subject_name,
    theory: s.theory_marks ?? 0,
    internal: (s.practical_marks ?? 0) + (s.ca_marks ?? 0),
    total: s.total_marks ?? 0,
    grade: s.grade,
  }));
  const total = r.grand_total_obtained;
  const max = r.grand_total_max;
  const percentage = max > 0 ? Math.round((total / max) * 10000) / 100 : 0;

  return {
    candidate: {
      name: r.candidate_name,
      father: r.father_name || "",
      enrollment: r.enrollment_no,
      cls,
      session,
      dob,
    },
    subjects,
    summary: { total, max, percentage, status: r.final_result },
  };
}
