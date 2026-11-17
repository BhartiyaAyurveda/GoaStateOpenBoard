import LoginShell from "@/components/LoginShell";

export const revalidate = 60; // contact details (header menu, footer, help boxes) come from the dashboard

export const metadata = {
  title: "Board Login | Goa State Open School",
  description: "Secure login for Goa State Open School Board officials.",
  robots: { index: false, follow: false },
};

export default function BoardLoginPage() {
  return <LoginShell role="board" />;
}
