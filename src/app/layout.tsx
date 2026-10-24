import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { SESSION_HINT_HEADER, decodeHint } from "@/lib/auth/session-hint";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n/provider";
import { locales, defaultLocale, type Locale } from "@/i18n/config";
import { AuthProvider } from "@/lib/auth/context";
import { UsageProvider } from "@/lib/usage/context";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Fonts are in the project (src/app/fonts) so building never needs Google Fonts
const poppins = localFont({
  variable: "--font-poppins",
  src: [
    { path: "./fonts/poppins-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/poppins-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

const inter = localFont({
  variable: "--font-inter",
  src: "./fonts/inter-latin-variable.woff2",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerForge AI — AI-Powered Career Platform",
  description: "Create ATS-standard resumes, AI-powered cover letters, analyze job listings, and optimize your entire job application with CareerForge AI.",
  keywords: ["resume builder", "AI resume", "cover letter", "ATS optimization", "ATS standards", "job analysis", "job application", "career platform"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/brand/careerforge-icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // Picture shown when a link to the site is shared (WhatsApp, LinkedIn, X...)
  openGraph: {
    type: "website",
    siteName: "CareerForge AI",
    title: "CareerForge AI — Forge your career with AI",
    description: "ATS-ready resumes, AI cover letters and job tracking in one place.",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "CareerForge AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerForge AI — Forge your career with AI",
    images: ["/brand/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Render the page in the visitor's saved language so the server HTML
  // matches what the browser shows (no English flash, no hydration errors)
  const saved = (await cookies()).get("cf-locale")?.value;
  const locale: Locale = locales.includes(saved as Locale) ? (saved as Locale) : defaultLocale;
  // Who is signed in (from the proxy), so the header shows the account menu at once
  const sessionHint = decodeHint((await headers()).get(SESSION_HINT_HEADER));

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={true}
        >
          <LocaleProvider initialLocale={locale}>
            <AuthProvider sessionHint={sessionHint}>
              <UsageProvider>
                {children}
                <Toaster />
              </UsageProvider>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}