import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--site-ink) / <alpha-value>)",
        "ink-2": "rgb(var(--site-ink) / <alpha-value>)",
        muted: "rgb(var(--site-muted) / <alpha-value>)",
        faint: "rgb(var(--site-muted) / <alpha-value>)",
        edge: "rgb(var(--site-edge) / <alpha-value>)",
        "edge-strong": "rgb(var(--site-edge) / <alpha-value>)",
        "bg-gray": "rgb(var(--site-bg) / <alpha-value>)"
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", '"SF Pro Text"', '"PingFang SC"',
          '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Helvetica Neue"', "Arial", "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
