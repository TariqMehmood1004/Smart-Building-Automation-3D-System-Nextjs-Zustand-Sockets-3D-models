import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import THeader from "@/components/THeader";
import { TClientToaster } from "@/components/TClientToaster";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Building Management System",
  description: "Smart Building Management System for Energy Efficiency, and Sustainability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
        suppressHydrationWarning
      >
        <TClientToaster />
        {/* <THeader /> */}
        {children}
      </body>
    </html>
  );
}
