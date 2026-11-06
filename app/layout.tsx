import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import "@/styles/palettes.css";
import "@/styles/liquid-glass.css";
import Toaster from "@/components/Toaster";
import PaletteProvider from "@/components/PaletteProvider";
import { PrefsProvider } from "@/lib/prefsContext";
import { PREFS_COOKIE, parsePrefsCookie } from "@/lib/prefsCookie";
import { readThemeFromCookieHeader } from "@/lib/theme";
import type { CSSProperties } from "react";

const shellStyle: CSSProperties = {
  ["--site-bg-light" as string]: "245 246 248",
  ["--site-surface-light" as string]: "255 255 255",
  ["--site-ink-light" as string]: "32 36 44",
  ["--site-muted-light" as string]: "96 104 117",
  ["--site-accent-light" as string]: "8 102 255",
  ["--site-edge-light" as string]: "220 224 231",
  ["--site-soft-light" as string]: "236 239 243",
  ["--site-bg-dark" as string]: "17 19 24",
  ["--site-surface-dark" as string]: "27 31 39",
  ["--site-ink-dark" as string]: "237 240 246",
  ["--site-muted-dark" as string]: "170 178 192",
  ["--site-accent-dark" as string]: "8 102 255",
  ["--site-edge-dark" as string]: "52 59 71",
  ["--site-soft-dark" as string]: "40 46 57",
  ["--site-action" as string]: "#0866ff",
  ["--site-action-text" as string]: "#ffffff",
  ["--site-action-icon-filter" as string]: "brightness(0) invert(1)",
  ["--site-action-hover" as string]: "color-mix(in srgb, #0866ff 90%, #000)",
  ["--site-font-family" as string]: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  ["--site-entry-weight" as string]: "400"
};

export const metadata: Metadata = {
  title: "McLaren",
  description: "迈凯轮 3D 展示台与车型画册"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const header = cookieStore.toString();
  const dark = readThemeFromCookieHeader(header) !== "light";
  const prefs = parsePrefsCookie(cookieStore.get(PREFS_COOKIE)?.value);
  const themeClass = dark ? "dark notranslate" : "notranslate";
  return (
    <html lang="zh-CN" translate="no" className={themeClass} data-palette="neutral" data-accent="blue" data-theme-mode={dark ? "dark" : "light"} data-material="solid" style={shellStyle}>
      <body className="font-sans">
        <PaletteProvider>
          <PrefsProvider initialPrefs={prefs}>
            <Toaster />
            {children}
          </PrefsProvider>
        </PaletteProvider>
      </body>
    </html>
  );
}
