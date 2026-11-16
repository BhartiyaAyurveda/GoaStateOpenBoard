import { NextResponse } from "next/server";
import { requireAdmin, requireCollege } from "@/lib/auth";
import { getImageKit } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

// Student document uploads (photo, signature, marksheets, ID proofs).
// Only a signed-in college or board admin may upload; the type is checked by its
// real file signature (not just the client-sent MIME type); size is capped; and the
// ImageKit folder is fixed on the server, never taken from the client.

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const UPLOAD_FOLDER = "/goa-open-school/registrations";

function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" };
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  return null;
}

export async function POST(request) {
  try {
    const session = (await requireCollege(request)) || (await requireAdmin(request));
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File must be between 1 byte and 5 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = sniff(buffer);
    if (!kind) return NextResponse.json({ error: "Only JPG, PNG, WEBP or PDF files are allowed" }, { status: 400 });

    const result = await getImageKit().upload({
      file: buffer,
      fileName: `doc.${kind.ext}`, // server-chosen name; the client name is never used
      folder: UPLOAD_FOLDER,
      useUniqueFileName: true,
    });

    return NextResponse.json({ url: result.url, fileId: result.fileId });
  } catch (err) {
    console.error("Upload error:", err?.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
