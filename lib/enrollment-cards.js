// SERVER-ONLY enrollment card lookup for the public Enrollment Card page. Never import from a client component.
//
// Returns a card only when BOTH the enrollment number and the date of birth match a student whose
// admission has been approved by the Board, so cards cannot be enumerated by enrollment number alone.
// (The enrollment number is generated when the Study Centre registers the student.)
import { supabaseAdmin } from "@/lib/supabase";
import { subjectsForStudent, loadSelectedSubjectIds } from "@/lib/student-subjects";
import { courseMatchesClass } from "@/lib/result-options";

export function enrollmentCardsAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

// open-schooling enrolment is valid for 5 years (see the programme pages: "9 chances in 5 years")
const VALID_YEARS = 5;

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// The enrollment date follows the student's academic session, not the day the record was typed in.
// A student of session 2015-2016 registered today gets the same day and month in that session (April to March):
// 18 Nov -> 18-11-2015; 10 Feb -> 10-02-2016. It never moves into the future: if that date would be later
// than the real registration date (the current session), the real date is kept.
function enrollmentDateForSession(createdAt, session) {
  const real = new Date(createdAt);
  const startYear = Number(String(session || "").match(/\b(19|20)\d{2}\b/)?.[0]);
  if (!startYear || Number.isNaN(real.getTime())) return real;
  const month = real.getUTCMonth(); // 0 = Jan
  const year = month >= 3 ? startYear : startYear + 1; // April onwards falls in the session's first year
  const day = Math.min(real.getUTCDate(), new Date(Date.UTC(year, month + 1, 0)).getUTCDate()); // 29 Feb safety
  const backdated = new Date(Date.UTC(year, month, day));
  return backdated.getTime() > real.getTime() ? real : backdated;
}

// `cls` ("X" or "XII") is the class tab the student chose; a student of the other class gets nothing.
export async function findEnrollmentCard({ enrollment, dob, cls }) {
  if (!enrollmentCardsAvailable()) return null;

  const { data: reg, error } = await supabaseAdmin
    .from("student_registrations")
    .select(
      "id, enrollment_no, candidate_name, father_name, mother_name, dob, gender, category, academic_session, photo_url, created_at, language_subject_id, courses(course_name, course_code, category), colleges(college_name, city, state)",
    )
    .eq("enrollment_no", enrollment)
    .eq("dob", dob)
    .eq("status", "approved")
    .maybeSingle();
  if (error || !reg) return null;
  if (!courseMatchesClass(reg.courses, cls)) return null;

  const courseName = reg.courses?.course_name || "";

  // the subjects of the programme (first year), same rule as the admit card
  let subjects = [];
  if (courseName) {
    const { data: rows } = await supabaseAdmin
      .from("course_subjects")
      .select("id, subject_name, subject_code, is_language_option")
      .eq("course_name", courseName)
      .or("year_number.eq.1,year_number.is.null")
      .order("created_at", { ascending: true });
    // compulsory subjects + the language option the student chose
    subjects = subjectsForStudent(rows || [], reg.language_subject_id, await loadSelectedSubjectIds(reg.id)).map((s) => ({ code: s.subject_code || "", name: s.subject_name }));
  }

  const enrolled = enrollmentDateForSession(reg.created_at, reg.academic_session);
  const validTill = new Date(Date.UTC(enrolled.getUTCFullYear() + VALID_YEARS, enrolled.getUTCMonth(), enrolled.getUTCDate() - 1));

  const college = reg.colleges;
  return {
    candidate: {
      name: reg.candidate_name,
      father: reg.father_name || "",
      mother: reg.mother_name || "",
      enrollment: reg.enrollment_no,
      dob: reg.dob,
      gender: reg.gender || "",
      category: reg.category || "",
      programme: courseName,
      session: reg.academic_session || "",
      enrolledOn: isoDate(enrolled),
      validTill: isoDate(validTill),
    },
    centre: {
      name: college?.college_name || "",
      address: [college?.city, college?.state].filter(Boolean).join(", "),
    },
    subjects,
    photoUrl: reg.photo_url || "",
  };
}
