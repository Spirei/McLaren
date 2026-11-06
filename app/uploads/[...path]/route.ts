import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  gif: "image/gif", svg: "image/svg+xml", json: "application/json",
  glb: "model/gltf-binary", gltf: "model/gltf+json", bin: "application/octet-stream",
  hdr: "image/vnd.radiance", ktx2: "image/ktx2",
  mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", wav: "audio/wav"
};

const ROOT = path.join(process.cwd(), "public", "uploads");

function isImmutableAsset(segments: string[]) {
  return segments[0] === "mclaren" && (segments[1] === "models" || segments[1] === "env");
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segs } = await ctx.params;
  const rel = (segs || []).join("/");
  if (!rel || rel.includes("..") || rel.includes("\0") || segs.some(segment => /[\\/]/.test(segment))) {
    return new NextResponse("Bad Request", { status: 400 });
  }
  const normalized = path.normalize(rel);
  const abs = path.join(ROOT, normalized);
  if (!abs.startsWith(ROOT + path.sep)) return new NextResponse("Bad Request", { status: 400 });
  try {
    if (!fs.realpathSync(abs).startsWith(fs.realpathSync(ROOT) + path.sep)) throw new Error("Invalid path");
    const stat = fs.statSync(abs);
    if (!stat.isFile()) throw new Error("Not a file");
    const ext = (path.extname(abs) || "").slice(1).toLowerCase();
    const headers: Record<string, string> = {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": isImmutableAsset(segs) ? "public, max-age=31536000, immutable" : "public, max-age=3600, stale-while-revalidate=86400",
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'"
    };
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (match) {
        const suffix = !match[1] && match[2] ? Number(match[2]) : 0;
        const start = suffix > 0 ? Math.max(0, stat.size - suffix) : match[1] ? Number(match[1]) : 0;
        const end = suffix > 0 ? stat.size - 1 : match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
        if ((match[1] || suffix > 0) && Number.isSafeInteger(start) && Number.isSafeInteger(end) && start <= end && start < stat.size) {
          const stream = Readable.toWeb(fs.createReadStream(abs, { start, end })) as ReadableStream<Uint8Array>;
          return new NextResponse(stream, {
            status: 206,
            headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": String(end - start + 1) }
          });
        }
      }
      return new NextResponse(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${stat.size}` } });
    }
    const stream = Readable.toWeb(fs.createReadStream(abs)) as ReadableStream<Uint8Array>;
    return new NextResponse(stream, { headers: { ...headers, "Content-Length": String(stat.size) } });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
