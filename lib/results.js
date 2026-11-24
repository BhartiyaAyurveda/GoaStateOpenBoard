// SERVER-ONLY result lookup for the public Result page. Never import from a client component.
//
// Reads the results published from the Board dashboard (Exam Management → Results).
// A result is only returned when BOTH the enrollment number and the date of birth match
// a student whose registration is approved AND whose result has been published, so
// results cannot be enumerated by enrollment number alone.
import { supabaseAdmin } from "@/lib/supabase";
import { getResultData } from "@/lib/result-data";
import { courseMatchesClass } from "@/lib/result-options";

export function resultsAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

// The student looks the result up with the ROLL NUMBER (printed on the admit card) and the date of birth.
// `cls` ("X" or "XII") is the class tab the student chose: Class X and Class XII results are looked up
// separately, so a Class XII roll number never returns a result from the Class X tab (and vice versa).

export async function findResult({ rollNo, dob, cls: wantedCls }) {
  const { data: rows } = await supabaseAdmin
    .from("student_registrations")
    .select("id, courses(course_code, category)")
    .eq("roll_no", rollNo)
    .eq("dob", dob)
    .eq("status", "approved")
    .not("result_published_at", "is", null)
    .limit(2);

  // exactly one student must match; if the roll number + date of birth were ever ambiguous, show nothing
  if (!rows || rows.length !== 1) return null;
  const reg = rows[0];
  const cls = reg.courses?.course_code || "";

  // the student's programme must be the class that was selected (matched by course code, or by category if the code was edited)
  if (!courseMatchesClass(reg.courses, wantedCls)) return null;

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
      session: r.session_label,
      dob,
    },
    subjects,
    summary: { total, max, percentage, status: r.final_result },
    // everything the full-size marksheet (ResultMarksheet) shows; only for the verified student
    marksheet: {
      name: r.candidate_name,
      rollNo: r.roll_no,
      fatherName: r.father_name || "",
      motherName: r.mother_name || "",
      enrolmentNo: r.enrollment_no,
      dob: r.dob,
      course: r.course,
      institute: r.center_name,
      instituteCode: r.center_code,
      photoUrl: r.photo_url || "",
      session: r.session_label,
      examYear: r.exam_year_label,
      subjects: r.subjects.map((s) => ({
        code: s.subject_code || "",
        name: s.subject_name,
        thMax: s.theory_max ?? 0,
        prMax: s.practical_max ?? 0,
        caMax: s.ca_max ?? 0,
        totalMax: s.total_max ?? 0,
        thObt: s.theory_marks,
        prObt: s.practical_marks,
        caObt: s.ca_marks,
        totalObt: s.total_marks ?? 0,
        grade: s.grade,
        pass: s.subject_result === "PASS",
      })),
      grandTotalMax: max,
      grandTotalObt: total,
      percentage,
      status: r.final_result,
    },
  };
}
