// SERVER-ONLY enrollment card lookup. Never import this file from a client component.
//
// No enrollment database is wired up yet. Until there is:
//  - in development one clearly-marked SAMPLE record can be looked up so the
//    design can be reviewed;
//  - in production every lookup returns "not available" (no sample data is
//    ever served).
//
// To go live, replace `findEnrollmentCard` with a query against the real store
// (credentials from server-only env vars, never NEXT_PUBLIC_*). Always match on
// BOTH acknowledgement number and date of birth so cards cannot be enumerated.

const SAMPLE = { acknowledgement: "ACK000001", dob: "2008-05-14" };

export function enrollmentCardsAvailable() {
  return process.env.NODE_ENV !== "production";
}

export async function findEnrollmentCard({ acknowledgement, dob }) {
  if (!enrollmentCardsAvailable()) return null;
  if (acknowledgement !== SAMPLE.acknowledgement || dob !== SAMPLE.dob) return null;

  return {
    sample: true,
    candidate: {
      name: "SAMPLE CANDIDATE",
      father: "SAMPLE FATHER",
      mother: "SAMPLE MOTHER",
      enrollment: "GOS000001",
      acknowledgement: SAMPLE.acknowledgement,
      dob: SAMPLE.dob,
      gender: "Male",
      category: "General",
      programme: "Class X – Secondary",
      session: "2026–27",
      medium: "English",
      enrolledOn: "2026-08-12",
      validTill: "2031-08-11",
    },
    centre: { name: "SAMPLE STUDY CENTRE", address: "Panaji, Goa – 403001" },
    subjects: [
      { code: "301", name: "English" },
      { code: "302", name: "Hindi" },
      { code: "211", name: "Mathematics" },
      { code: "212", name: "Science & Technology" },
      { code: "213", name: "Social Science" },
      { code: "214", name: "Economics" },
    ],
  };
}
