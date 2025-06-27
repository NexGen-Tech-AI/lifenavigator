import { Inter } from "next/font/google";

// Use Inter as a more reliable fallback font
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

// Export CSS variables for fonts
export const fontVariables = `${inter.variable}`;

// Font class names for body
export const fontClassName = inter.className;