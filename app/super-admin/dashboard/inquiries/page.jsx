import { redirect } from "next/navigation";

// The inbox now lives in the dashboard's Contact Inquiries tab.
export default function InquiriesRedirect() {
  redirect("/super-admin/dashboard?tab=inquiries");
}
