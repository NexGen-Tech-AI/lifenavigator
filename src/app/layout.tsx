import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Analytics } from "@/components/analytics/Analytics";

// Font configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "Life Navigator | Secure Life Management",
  description: "Secure, AI-powered life management platform for finance, career, education, and healthcare guidance",
  keywords: ["life management", "AI advisor", "financial planning", "career development", "education planning", "healthcare management"],
  authors: [{ name: "NexLevel Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexlevel-intelligence.com",
    siteName: "Life Navigator",
    title: "Life Navigator | Secure Life Management",
    description: "Secure, AI-powered life management platform for finance, career, education, and healthcare guidance",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Life Navigator",
      },
    ],
  },
};

// Root layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - visible on larger screens */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex flex-col flex-1 w-full overflow-hidden">
              {/* Header */}
              <Header />

              {/* Main content with scrolling */}
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
