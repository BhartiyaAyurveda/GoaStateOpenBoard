import LoginShell from "@/components/LoginShell";

export const revalidate = 60; // contact details (header menu, footer, help boxes) come from the dashboard

export const metadata = {
  title: "College Login | Goa State Open School",
  description: "Secure login for Goa State Open School Study Centres and affiliated colleges.",
  robots: { index: false, follow: false },
};

export default function CollegeLoginPage() {
  return <LoginShell role="college" />;
}
