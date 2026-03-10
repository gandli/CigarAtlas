import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CigarAtlas - 雪茄爱好者的社区",
  description: "Community app for cigar enthusiasts: tasting journal, social circles, local meetups, and humidor management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CigarAtlas",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0A09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${jost.variable} font-sans antialiased`}>
        <div className="min-h-screen pb-20 md:pb-0">
          {children}
        </div>
        <Navigation />
      </body>
    </html>
  );
}