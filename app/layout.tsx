import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ColorProvider } from "@/context/color-provider";
import { DirectionProvider } from "@/context/direction-provider";
import { FontProvider } from "@/context/font-provider";
import { PreferencesProvider } from "@/context/preferences-provider";
import { QueryProvider } from "@/context/query-provider";
import ToastProvider from "@/context/toast-providers";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OptiAssets",
    template: "OptiAssets - %s",
  },
  description: "Aplikasi manajemen verifikasi data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeProvider>
            <ColorProvider>
              <FontProvider>
                <PreferencesProvider>
                  <DirectionProvider>
                    <ToastProvider>{children}</ToastProvider>
                  </DirectionProvider>
                </PreferencesProvider>
              </FontProvider>
            </ColorProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
