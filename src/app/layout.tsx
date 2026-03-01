import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@/app/globals.css";
import { env } from "@/lib/config/env";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: "Forge client portal"
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
