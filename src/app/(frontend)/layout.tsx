import type { Metadata } from "next";
import { Anton, Poppins } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "../globals.css";

export const metadata: Metadata = {
  title: "Apollo Vidhyalayam | CBSE School in Aragonda",
  description: "Rural school website frontend",
};

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

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${anton.variable} ${poppins.variable} h-full antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
