// SERVER-ONLY: courses (programmes) managed in Board dashboard > Courses & Subjects.
// The homepage sections and the /courses page read them from here.
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { PROGRAMMES } from "@/lib/programmes";

const CODE_TO_PROGRAMME = { X: "class-x", XII: "class-xii" };
const CATEGORY_TO_PROGRAMME = { secondary: "class-x", senior_secondary: "class-xii" };

const txt = (v, max = 600) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "");

export const prettyCategory = (c) => String(c || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

// all courses, in the dashboard's order, each with its subject names
export const getCourses = cache(async () => {
  try {
    const [{ data: courses, error }, { data: subs }] = await Promise.all([
      supabaseAdmin
        .from("courses")
        .select("id, course_name, course_name_hindi, course_code, duration_label, category, eligibility, career_scope, sort_order, created_at")
        .order("sort_order")
        .order("created_at"),
      supabaseAdmin.from("course_subjects").select("course_name, subject_name, year_number").order("year_number").order("subject_name"),
    ]);
    if (error || !courses) return [];

    const byCourse = new Map();
    for (const s of subs || []) {
      const list = byCourse.get(s.course_name) || [];
      const name = txt(s.subject_name, 120);
      if (name && !list.includes(name)) list.push(name);
      byCourse.set(s.course_name, list);
    }

    // a course links to a built-in programme page by its code (X / XII); by category only when that category is unique
    const catCount = {};
    for (const c of courses) catCount[c.category] = (catCount[c.category] || 0) + 1;

    return courses.map((c) => {
      const slug =
        CODE_TO_PROGRAMME[String(c.course_code || "").toUpperCase()] ||
        (catCount[c.category] === 1 ? CATEGORY_TO_PROGRAMME[c.category] : null);
      const programmeSlug = slug && PROGRAMMES[slug] ? slug : null;
      return {
        id: c.id,
        name: txt(c.course_name, 160),
        local: txt(c.course_name_hindi, 160),
        code: txt(c.course_code, 20),
        duration: txt(c.duration_label, 40),
        category: txt(c.category, 40),
        eligibility: txt(c.eligibility),
        about: txt(c.career_scope),
        subjects: byCourse.get(c.course_name) || [],
        programmeSlug,
        formUrl: programmeSlug ? PROGRAMMES[programmeSlug].form : null,
      };
    });
  } catch {
    return [];
  }
});
