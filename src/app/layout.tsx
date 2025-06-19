import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./dark-mode.css"; // Import the dark mode styles
import { Providers } from "@/providers";
import { Analytics } from "@/components/analytics/Analytics";
import { Toaster } from "@/components/ui/toaster";
import { getThemeScript } from "./theme-script";

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
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? 'https://nexlevel-intelligence.com' 
    : 'http://localhost:3000'),
  title: "Life Navigator | Secure Life Management",
  description: "Secure, AI-powered life management platform for finance, career, education, and healthcare guidance",
  keywords: ["life management", "AI advisor", "financial planning", "career development", "education planning", "healthcare management"],
  authors: [{ name: "NexLevel Team" }],
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

// Viewport
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Root layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
        <script src="/force-dark-mode.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `console.log('Inline script test working!');` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}