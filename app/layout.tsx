import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-provider";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = { title: "Phrase Pal", description: "Learn vocabulary with focused flashcards." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uk" suppressHydrationWarning><body><ThemeProvider><I18nProvider><AuthProvider>{children}</AuthProvider></I18nProvider></ThemeProvider></body></html>;
}
