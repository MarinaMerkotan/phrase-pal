import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/google-analytics";
import { AuthProvider } from "@/lib/auth-provider";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`),
  title: "Phrase Pal",
  description: "Learn vocabulary with focused flashcards.",
  authors: [{ name: "Phrase Pal" }],
  icons: {
    icon: [{ url: "/logo-cropped.webp", type: "image/webp" }],
    apple: "/logo-cropped.webp",
  },
  openGraph: {
    title: "Phrase Pal — Learn words. Speak with confidence.",
    description: "Build vocabulary with focused flashcards, pronunciation practice and progress tracking.",
    type: "website",
    siteName: "Phrase Pal",
    locale: "uk_UA",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phrase Pal — Learn words. Speak with confidence.",
    description: "Build vocabulary with focused flashcards, pronunciation practice and progress tracking.",
    images: [{ url: "/opengraph-image", alt: "Phrase Pal — Learn words. Speak with confidence." }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uk" suppressHydrationWarning><body><ThemeProvider><I18nProvider><AuthProvider>{children}</AuthProvider></I18nProvider></ThemeProvider><GoogleAnalytics /></body></html>;
}
