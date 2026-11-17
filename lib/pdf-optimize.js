// SERVER-ONLY: makes an uploaded PDF smaller before it is stored in ImageKit.
//  1) every embedded JPEG photo / scan is downscaled (longest side <= MAX_DIM px) and re-encoded;
//  2) the PDF is re-saved in its compact form (unused objects dropped, object streams on).
// The original is kept whenever optimising fails or would not make the file smaller, so an
// upload is never broken or made bigger by this step.
import { PDFDocument, PDFName, PDFNumber, PDFRawStream } from "pdf-lib";
import sharp from "sharp";

const MAX_DIM = 1600; // px: plenty for reading a document on screen / printing at A4
const JPEG_QUALITY = 70;
const MIN_IMAGE_BYTES = 40 * 1024; // do not bother with tiny images

const name = (n) => PDFName.of(n);
const asText = (o) => (o ? o.toString() : "");

export async function optimizePdf(input) {
  const before = input.length;
  try {
    const pdf = await PDFDocument.load(input, { updateMetadata: false });
    const ctx = pdf.context;

    for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
      if (!(obj instanceof PDFRawStream)) continue;
      const dict = obj.dict;
      if (asText(dict.get(name("Subtype"))) !== "/Image") continue;
      if (asText(dict.get(name("Filter"))) !== "/DCTDecode") continue; // JPEG only
      const space = asText(dict.get(name("ColorSpace")));
      const expectedChannels = space === "/DeviceRGB" ? 3 : space === "/DeviceGray" ? 1 : 0;
      if (!expectedChannels) continue; // CMYK / indexed / ICC: leave untouched
      if (asText(dict.get(name("ImageMask"))) === "true") continue;

      const bytes = obj.contents;
      if (bytes.length < MIN_IMAGE_BYTES) continue;

      try {
        const { data, info } = await sharp(bytes, { failOn: "none" })
          .resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toBuffer({ resolveWithObject: true });

        // only swap it in when it is really smaller and still the same colour model
        if (info.channels !== expectedChannels || data.length >= bytes.length) continue;

        dict.set(name("Width"), PDFNumber.of(info.width));
        dict.set(name("Height"), PDFNumber.of(info.height));
        dict.set(name("Length"), PDFNumber.of(data.length));
        ctx.assign(ref, PDFRawStream.of(dict, new Uint8Array(data)));
      } catch {
        /* leave this image as it is */
      }
    }

    const saved = Buffer.from(await pdf.save({ useObjectStreams: true }));
    if (saved.length < before && saved.subarray(0, 5).toString("latin1") === "%PDF-") {
      return { buffer: saved, before, after: saved.length, optimized: true };
    }
  } catch {
    /* encrypted / unusual PDF: store the original */
  }
  return { buffer: input, before, after: before, optimized: false };
}
