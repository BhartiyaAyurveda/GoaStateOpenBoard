// SERVER-ONLY admit card lookup for the public Admit Card page. Never import from a client component.
//
// Returns a card only when BOTH the enrollment number and date of birth match an approved
// student for whom the Board has generated an admit card (roll number allotted + datesheet
// complete), so cards cannot be enumerated by enrollment number alone.
import { supabaseAdmin } from "@/lib/supabase";
import { getAdmitCardData } from "@/lib/admit-card-data";

export function admitCardsAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

export async function findAdmitCard({ enrollment, dob }) {
  const { data: reg } = await supabaseAdmin
    .from("student_registrations")
    .select("id, courses(course_name)")
    .eq("enrollment_no", enrollment)
    .eq("dob", dob)
    .eq("status", "approved")
    .not("admit_card_generated_at", "is", null)
    .maybeSingle();
  if (!reg) return null;

  const { data: c } = await getAdmitCardData(reg.id, 1);
  if (!c) return null;

  return {
    candidate: {
      name: c.candidate_name,
      father: c.father_name || "",
      enrollment: c.enrollment_no,
      roll: c.roll_no,
      dob: c.dob,
      programme: c.course,
      examination: c.session_label,
    },
    centre: { name: c.center_name, address: "" },
    schedule: c.subjects.map((s) => ({
      date: s.exam_date,
      code: s.subject_code || "",
      subject: s.subject_name,
      time: s.exam_time,
    })),
  };
}
