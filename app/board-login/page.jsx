import LoginShell from "@/components/LoginShell";

export const metadata = {
  title: "Board Login | Goa Open School",
  description: "Secure login for Goa Open School Board officials.",
  robots: { index: false, follow: false },
};

export default function BoardLoginPage() {
  return <LoginShell role="board" />;
}
