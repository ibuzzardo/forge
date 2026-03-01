import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { env } from "@/lib/config/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: "Forge client portal"
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
