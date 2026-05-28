import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "優待アプリ(ベータ版) - 生活逆引き型 株主優待マッチング",
  description: "あなたの毎月の出費から、それを削減できる株主優待を提案。生活逆引き型の優待マッチングアプリ(ベータ版・個人開発・データ取得日2026年5月27日)。",
  applicationName: "優待アプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "優待アプリ",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "優待アプリ(ベータ版)",
    title: "優待アプリ(ベータ版) - 生活逆引き型 株主優待マッチング",
    description: "あなたの毎月の出費から、それを削減できる株主優待を提案。",
    url: "https://yutai-app-lyart.vercel.app",
  },
  twitter: {
    card: "summary",
    title: "優待アプリ(ベータ版)",
    description: "あなたの毎月の出費から、それを削減できる株主優待を提案。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1410" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
