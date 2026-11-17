// SERVER-ONLY enrollment card lookup for the public Enrollment Card page. Never import from a client component.
//
// Returns a card only when BOTH the enrollment number and the date of birth match a student whose
// admission has been approved by the Board, so cards cannot be enumerated by enrollment number alone.
// (The enrollment number is generated when the Study Centre registers the student.)
import { supabaseAdmin } from "@/lib/supabase";

export function enrollmentCardsAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

// open-schooling enrolment is valid for 5 years (see the programme pages: "9 chances in 5 years")
const VALID_YEARS = 5;

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export async function findEnrollmentCard({ enrollment, dob }) {
  if (!enrollmentCardsAvailable()) return null;

  const { data: reg, error } = await supabaseAdmin
    .from("student_registrations")
    .select(
      "id, enrollment_no, candidate_name, father_name, mother_name, dob, gender, category, academic_session, photo_url, created_at, courses(course_name), colleges(college_name, city, state)",
    )
    .eq("enrollment_no", enrollment)
    .eq("dob", dob)
    .eq("status", "approved")
    .maybeSingle();
  if (error || !reg) return null;

  const courseName = reg.courses?.course_name || "";

  // the subjects of the programme (first year), same rule as the admit card
  let subjects = [];
  if (courseName) {
    const { data: rows } = await supabaseAdmin
      .from("course_subjects")
      .select("subject_name, subject_code")
      .eq("course_name", courseName)
      .or("year_number.eq.1,year_number.is.null")
      .order("created_at", { ascending: true });
    subjects = (rows || []).map((s) => ({ code: s.subject_code || "", name: s.subject_name }));
  }

  const enrolled = new Date(reg.created_at);
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
