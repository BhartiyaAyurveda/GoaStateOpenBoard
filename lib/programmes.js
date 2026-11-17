// SAMPLE programme details, adapted from the general open-schooling scheme of
// other State Open Schools (e.g. jsos-ac.in "General Courses"). Verify every
// eligibility rule, age limit, subject and number against Goa State Open School's
// official Prospectus before publishing.

export const PROGRAMMES = {
  "class-x": {
    slug: "class-x",
    short: "Class X",
    title: "Secondary Programme – Class X",
    tagline: "Complete your secondary education at your own pace, through open schooling.",
    overview: [
      "The Secondary Programme leads to the Secondary School Certificate (Class X). It is meant for learners who are unable to attend regular school, including working youth, homemakers, learners in remote areas and those who left school early.",
      "Learners study through self-instructional study material and personal contact classes at accredited Study Centres, and appear for public examinations conducted twice a year.",
    ],
    facts: [
      { value: "6", label: "Subjects", sub: "plus 1 optional extra subject" },
      { value: "100 hrs", label: "Per subject", sub: "40 at centre + 60 self-study" },
      { value: "2 / year", label: "Public examinations", sub: "9 chances in 5 years" },
      { value: "33%", label: "Pass marks", sub: "in each subject" },
    ],
    eligibility: [
      "The candidate must have passed Class VIII (Middle School Examination) at least two years earlier than the year in which the Class X examination is taken.",
      "Minimum age: 14 years as on 1st August of the year in which admission is sought, with a declaration that the candidate has studied enough to pursue the secondary course in the open learning mode.",
      "A Transfer / School Leaving Certificate and proof of date of birth are required.",
    ],
    subjects: [
      ["Languages", "English, Konkani, Marathi, Urdu, Sanskrit"],
      ["Core subjects", "Mathematics, Science & Technology, Social Science"],
      ["Electives", "Economics, Home Science, Data Entry Operations, Painting"],
    ],
    documents: [
      "Duly filled Admission Form (Class X) with passport-size photograph",
      "Mark sheet / certificate of Class VIII",
      "Transfer / School Leaving Certificate",
      "Proof of date of birth (Birth Certificate)",
      "Caste / Community Certificate, if claimed",
      "Certificate for differently-abled candidates (40% or more), if applicable",
    ],
    form: "/forms/Admission-Form-Class-X.pdf",
  },
  "class-xii": {
    slug: "class-xii",
    short: "Class XII",
    title: "Senior Secondary Programme – Class XII",
    tagline: "Greater academic flexibility and a wide choice of subjects for higher education and careers.",
    overview: [
      "The Senior Secondary Programme leads to the Senior Secondary School Certificate (Class XII). It gives learners greater flexibility and a diverse choice of subjects to prepare for higher education and career advancement.",
      "Learners study through self-instructional study material and personal contact classes at accredited Study Centres, and appear for public examinations conducted twice a year.",
    ],
    facts: [
      { value: "5", label: "Subjects", sub: "plus 1 optional extra subject" },
      { value: "100 hrs", label: "Per subject", sub: "40 at centre + 60 self-study" },
      { value: "2 / year", label: "Public examinations", sub: "9 chances in 5 years" },
      { value: "33%", label: "Pass marks", sub: "in each subject" },
    ],
    eligibility: [
      "The candidate must have passed the Secondary (Class X) examination of Goa State Open School, or an equivalent examination of another recognised Board, at least two years earlier than the year in which the Class XII examination is taken.",
      "Minimum age: 16 years as on 1st August of the year in which admission is sought.",
      "A Transfer / School Leaving Certificate and the Class X mark sheet are required.",
    ],
    subjects: [
      ["Languages", "English, Konkani, Marathi, Urdu, Sanskrit"],
      ["Science subjects", "Physics, Chemistry, Biology, Mathematics"],
      ["Other core subjects", "Economics, Geography, Business Studies"],
      ["Electives", "Home Science, Psychology, Data Entry Operations"],
    ],
    documents: [
      "Duly filled Admission Form (Class XII) with passport-size photograph",
      "Class X mark sheet and pass certificate",
      "Transfer / School Leaving Certificate",
      "Proof of date of birth",
      "Caste / Community Certificate, if claimed",
      "Certificate for differently-abled candidates (40% or more), if applicable",
    ],
    form: "/forms/Admission-Form-Class-XII.pdf",
  },
};

export const PROGRAMME_LIST = Object.values(PROGRAMMES);
export const SYLLABUS_PDF = "/downloads/Syllabus-2026-27.pdf";
