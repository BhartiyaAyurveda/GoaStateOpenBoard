import { redirect } from "next/navigation";

// The Board admin sign-in lives at /board-login; signed-in admins are sent on to the dashboard by the proxy.
export default function SuperAdminIndex() {
  redirect("/super-admin/dashboard");
}
