"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "登录失败");
      router.push("/showcase/pipeline");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mcl-login">
      <form onSubmit={(event) => void submit(event)}>
        <h1>McLaren</h1>
        <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-label="管理员密码" />
        <button type="submit" disabled={busy || !password}>{busy ? "正在登录" : "登录"}</button>
        <p>{error}</p>
        <Link href="/">返回展示台</Link>
      </form>
    </main>
  );
}
