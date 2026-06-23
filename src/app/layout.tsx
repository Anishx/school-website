import type { Metadata } from "next";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const merriweather = Merriweather({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "School Name | Section-by-section Build",
  description: "Rural school website frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${merriweather.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<SiteFooter /></body>
    </html>
  );
}
