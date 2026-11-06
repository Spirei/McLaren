import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { adminPassword, adminSessionValue, isTrustedMutationRequest } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { readJsonBody, RequestBodyTooLargeError } from "@/lib/requestBody";

function sameSecret(given: string, expected: string) {
  const left = createHmac("sha256", "mclaren-login").update(given).digest();
  const right = createHmac("sha256", "mclaren-login").update(expected).digest();
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ error: "请求来源不被接受" }, { status: 403 });
  if (!rateLimit(`login:${clientIp(request)}`, 8, 15 * 60 * 1000)) return NextResponse.json({ error: "尝试过多，请稍后再试" }, { status: 429 });
  const password = adminPassword();
  if (!password) return NextResponse.json({ error: "服务器还没有设置管理员密码" }, { status: 503 });
  try {
    const body = await readJsonBody(request, 4096) as { password?: unknown } | null;
    const given = typeof body?.password === "string" ? body.password : "";
    if (!given || !sameSecret(given, password)) return NextResponse.json({ error: "密码不正确" }, { status: 401 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return NextResponse.json({ error: "请求过大" }, { status: 413 });
    return NextResponse.json({ error: "无法读取请求" }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true });
  response.headers.append("Set-Cookie", `mcl_session=${adminSessionValue()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
  return response;
}
