"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; text: string; type: "ok" | "err" | "cancel" };

export default function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    let seq = 0;
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ text?: string; type?: Toast["type"] }>).detail;
      if (!detail?.text) return;
      const id = ++seq;
      const type: Toast["type"] = detail.type === "err" || detail.type === "cancel" ? detail.type : "ok";
      const text = detail.text;
      setItems((current) => [...current, { id, text, type }].slice(-3));
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3200);
    };
    window.addEventListener("fire:toast", onToast);
    return () => window.removeEventListener("fire:toast", onToast);
  }, []);
  if (!items.length) return null;
  return (
    <div className="mcl-toasts" role="status">
      {items.map((item) => <div key={item.id} className={`mcl-toast ${item.type}`}>{item.text}</div>)}
    </div>
  );
}
