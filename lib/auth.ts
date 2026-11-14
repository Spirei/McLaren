import { createHmac } from "crypto";

export function adminPassword() {
  return process.env.MCLAREN_ADMIN_PASSWORD || "";
}

export function adminSessionValue(password = adminPassword()) {
  if (!password) return "";
  return createHmac("sha256", "mclaren-session").update(password).digest("hex");
}

export function getAuthUser(_request: Request): { id: string; role: "admin" } {
  return { id: "local", role: "admin" };
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
