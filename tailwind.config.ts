import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#14B8A6",
        background: "#0B1020",
        foreground: "#E5E7EB",
        muted: "#1F2937",
        accent: "#8B5CF6",
        destructive: "#EF4444"
      },
      borderRadius: {
        lg: "10px",
        xl: "12px",
        "2xl": "16px"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
