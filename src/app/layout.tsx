import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n/provider";
import { AuthProvider } from "@/lib/auth/context";
import { UsageProvider } from "@/lib/usage/context";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerForge AI — AI-Powered Career Platform",
  description: "Create ATS-standard resumes, AI-powered cover letters, analyze job listings, and optimize your entire job application with CareerForge AI.",
  keywords: ["resume builder", "AI resume", "cover letter", "ATS optimization", "ATS standards", "job analysis", "job application", "career platform"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={true}
        >
          <LocaleProvider>
            <AuthProvider>
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