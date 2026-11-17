// Notice helpers. The notices themselves live in the database (announcements table) and are
// managed from the Board dashboard > Announcements. `date` is ISO (YYYY-MM-DD).

export const NOTICE_CATEGORIES = ["Admission", "Examination", "Study Centres", "General"];

export const formatNoticeDate = (iso) => {
  const [y, m, d] = iso.split("-");
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1];
  return `${d} ${mon} ${y}`;
};
