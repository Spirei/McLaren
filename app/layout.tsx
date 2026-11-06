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

export const metadata: Metadata = {
  title: "McLaren",
  description: "迈凯轮 3D 展示台与车型画册"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const header = cookieStore.toString();
  const dark = readThemeFromCookieHeader(header) !== "light";
  const prefs = parsePrefsCookie(cookieStore.get(PREFS_COOKIE)?.value);
  return (
    <html lang="zh-CN" className={dark ? "dark" : undefined}>
      <body>
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
