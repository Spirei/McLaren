import { createHash } from "crypto";
import { isIP } from "node:net";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
  if (!/^(1|true|yes)$/i.test(process.env.MCLAREN_TRUST_PROXY_HEADERS || "")) return "direct";
  const fwd = request.headers.get("x-forwarded-for");
  const xri = request.headers.get("x-real-ip");
  const configured = process.env.MCLAREN_TRUST_PROXY_HOPS || "1";
  if (!/^[1-9]\d?$/.test(configured) || Number(configured) > 16) return "unknown";
  const chain = fwd?.split(",");
  if (fwd && (fwd.length > 2048 || !chain || chain.length > 32 || chain.length < Number(configured))) return "unknown";
  const ip = (fwd ? chain![chain!.length - Number(configured)] : xri || "").trim();
  const family = isIP(ip);
  if (family === 4) return ip;
  if (family === 6 && !ip.includes("%")) {
    const canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
    const mapped = canonical.match(/^::ffff:([a-f\d]{1,4}):([a-f\d]{1,4})$/);
    if (mapped) { const a = parseInt(mapped[1], 16), b = parseInt(mapped[2], 16); return [a >> 8, a & 255, b >> 8, b & 255].join("."); }
    return canonical;
  }
  return "unknown";
}

export function loginIdentityKey(login: string): string {
  return createHash("sha256").update(login.trim().toLowerCase()).digest("hex");
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function rateLimitGlobal(category: string, limit: number, windowMs: number): boolean {
  return rateLimit(`global:${category}`, limit, windowMs);
}

const cleaner = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.resetAt < now) buckets.delete(key);
}, 10 * 60 * 1000);
cleaner.unref?.();
