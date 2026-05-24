import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "Bamboo - Move Markets, Build Empires",
  description: "The premier investing platform for ambitious deal-makers",
  keywords: ["investing", "ventures", "capital", "dealmaking", "wealth"],
  openGraph: {
    title: "Bamboo - Move Markets, Build Empires",
    description: "The premier investing platform for ambitious deal-makers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} h-full antialiased`} suppressHydrationWarning data-theme="light">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
