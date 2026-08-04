import type { Metadata } from "next";
import { Anton, Poppins } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const anton = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Apollo Vidhyalayam | CBSE School in Aragonda",
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
      className={`${anton.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<SiteFooter /></body>
    </html>
  );
}
