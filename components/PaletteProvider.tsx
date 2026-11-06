"use client";

import { createContext, useContext, type ReactNode } from "react";

const PaletteContext = createContext({ palette: "studio" });

export function useSitePalette() {
  return useContext(PaletteContext);
}

export default function PaletteProvider({ children }: { children: ReactNode }) {
  return <PaletteContext.Provider value={{ palette: "studio" }}>{children}</PaletteContext.Provider>;
}
