import ResetPageZoom from "@/components/ResetPageZoom";

export const dynamic = "force-dynamic";

export default function SuperAdminDashboardLayout({ children }) {
  return (
    <>
      <ResetPageZoom />
      {children}
    </>
  );
}
