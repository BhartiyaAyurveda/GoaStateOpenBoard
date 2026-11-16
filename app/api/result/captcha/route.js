import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/captcha";

// Only GET is exported; other methods get a 405.
export async function GET() {
  try {
    const challenge = createChallenge();
    if (!challenge) {
      return NextResponse.json({ ok: false, error: "Verification is not available." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ ok: true, ...challenge }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Something went wrong." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
