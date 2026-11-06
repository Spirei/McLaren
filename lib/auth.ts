import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "mcl_session";

export function adminPassword() {
  return process.env.MCLAREN_ADMIN_PASSWORD || "";
}

export function adminSessionValue(password = adminPassword()) {
  if (!password) return "";
  return createHmac("sha256", "mclaren-session").update(password).digest("hex");
}

function readCookie(header: string, name: string) {
  const matched = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!matched) return "";
  try { return decodeURIComponent(matched[1]); } catch { return matched[1]; }
}

export function getAuthUser(request: Request): { id: string; role: "admin" } | null {
  const expected = adminSessionValue();
  if (!expected) return null;
  const given = readCookie(request.headers.get("cookie") || "", COOKIE);
  if (!given || given.length !== expected.length) return null;
  try {
    if (timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return { id: "admin", role: "admin" };
  } catch { /* 长度已对齐，比较失败按未登录处理。 */ }
  return null;
}

export function isAdmin(user: { role?: string } | null | undefined) {
  return user?.role === "admin";
}

/** 写请求必须来自同源页面。没有 Origin 的本机调用仍然允许。 */
export function isTrustedMutationRequest(request: Request): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return true;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin) return fetchSite !== "cross-site";
  try {
    const originUrl = new URL(origin);
    const host = (request.headers.get("host") ?? new URL(request.url).host).toLowerCase();
    return (originUrl.protocol === "http:" || originUrl.protocol === "https:") && originUrl.host.toLowerCase() === host;
  } catch {
    return false;
  }
}
