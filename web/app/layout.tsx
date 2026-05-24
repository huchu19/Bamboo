import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Bamboo - Plant Your Seed. Build Your Portfolio.",
  description: "A two-sided investing marketplace for innovative ideas",
  keywords: ["investing", "startups", "pitches", "entrepreneurship"],
  openGraph: {
    title: "Bamboo - Investing Platform",
    description: "Plant Your Seed. Build Your Portfolio.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
