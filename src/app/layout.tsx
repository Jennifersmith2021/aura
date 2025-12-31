import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Navigation } from "@/components/Navigation";
import { PageTransition } from "@/components/PageTransition";
import { AppProviders } from "@/components/AppProviders";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
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
        className={`${inter.variable} antialiased bg-background text-foreground min-h-screen pb-20 lg:pb-0`}
      >
        <AppProviders>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background">
              <PageTransition className="min-h-screen">
                {children}
              </PageTransition>
            </main>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <Navigation />
        </AppProviders>
      </body>
    </html>
  );
}
