import LoginShell from "@/components/LoginShell";

export const metadata = {
  title: "College Login | Goa Open School",
  description: "Secure login for Goa Open School Study Centres and affiliated colleges.",
  robots: { index: false, follow: false },
};

export default function CollegeLoginPage() {
  return <LoginShell role="college" />;
}
