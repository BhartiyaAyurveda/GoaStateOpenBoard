import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getImageKit } from "@/lib/imagekit";
import { optimizePdf } from "@/lib/pdf-optimize";

export const dynamic = "force-dynamic";

// Uploads a PDF / image for a homepage link (e.g. an admission form) and returns its URL.
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function safeFileName(original) {
  const ext = original.match(/\.(pdf|jpg|jpeg|png|webp)$/i)?.[1]?.toLowerCase() || "pdf";
  const base = original
    .replace(/\.[^.]+$/, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "file"}.${ext}`;
}

export async function POST(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Only PDF or image files are allowed" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File must be 5 MB or smaller" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.type === "application/pdf" && buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "File is not a valid PDF" }, { status: 400 });
  }

  // PDFs are compressed before they are stored (falls back to the original if that fails)
  let toStore = buffer;
  if (file.type === "application/pdf") toStore = (await optimizePdf(buffer)).buffer;

  try {
    const res = await getImageKit().upload({
      file: toStore,
      fileName: safeFileName(file.name),
      folder: "/home",
      useUniqueFileName: true,
    });
    return NextResponse.json({ ok: true, url: res.url, name: file.name, originalSize: buffer.length, size: toStore.length }, { status: 201 });
  } catch (err) {
    console.error("Home upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
