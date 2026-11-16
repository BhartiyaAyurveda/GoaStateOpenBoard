import { NextResponse } from "next/server";
import { requestOtp, emailOtpEnabled } from "@/lib/otp";
import { requireCollege } from "@/lib/auth";

// Only a logged-in college may trigger OTP e-mails (prevents e-mail bombing).
export async function POST(request) {
  try {
    const session = await requireCollege(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email } = await request.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 254 || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!emailOtpEnabled()) {
      return NextResponse.json({ ok: true, skipped: true, message: "Email verification is not enabled." });
    }

    const result = await requestOtp(email.trim(), "student_verification");
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    return NextResponse.json({ ok: true, message: "OTP sent to your email address." });
  } catch (err) {
    console.error("Send OTP error:", err?.message);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
