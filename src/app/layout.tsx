import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { PageTransition } from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura | Style & Beauty Companion",
  description: "Your personal guide to style, beauty, and transition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen pb-20`}
      >
        <main className="max-w-md mx-auto min-h-screen bg-background shadow-2xl shadow-black/5 overflow-hidden relative">
          {/* Mobile-first container */}
          <PageTransition className="min-h-screen">
            {children}
          </PageTransition>
        </main>
        <Navigation />
      </body>
    </html>
  );
}
