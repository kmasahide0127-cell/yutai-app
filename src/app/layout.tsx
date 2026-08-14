import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { DATA_LAST_UPDATED } from "@/lib/yutai-data";

function formatJapaneseDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "優待マッチ - 生活逆引き型 株主優待マッチング",
    template: "%s | 優待マッチ",
  },
  description: `あなたの毎月の出費から、それを削減できる株主優待を提案。生活逆引き型の優待マッチングアプリ(個人開発・データ取得日${formatJapaneseDate(DATA_LAST_UPDATED)})。`,
  keywords: [
    "株主優待",
    "優待",
    "節約",
    "投資",
    "生活費",
    "出費削減",
    "ライフスタイル",
    "個人投資家",
    "優待検索",
    "優待マッチ",
  ],
  authors: [{ name: "優待マッチ運営" }],
  creator: "優待マッチ運営",
  alternates: {
    canonical: "/",
  },
  applicationName: "優待マッチ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "優待マッチ",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "優待マッチ",
    title: "優待マッチ - 生活逆引き型 株主優待マッチング",
    description: "あなたの毎月の出費から、それを削減できる株主優待を提案。",
    url: siteConfig.url,
  },
  twitter: {
    card: "summary",
    title: "優待マッチ",
    description: "あなたの毎月の出費から、それを削減できる株主優待を提案。",
  },
  verification: {
    google: "jgPNNlbtlPcjWgzk15apXH7E7YspulIJawV0VuxF7g0",
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6624294914787679"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: siteConfig.name,
                url: siteConfig.url,
                description: siteConfig.description,
                inLanguage: "ja-JP",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${siteConfig.url}/stocks`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: siteConfig.name,
                url: siteConfig.url,
                description: siteConfig.description,
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  email: "yutaiinfoshare@gmail.com",
                  availableLanguage: "Japanese",
                },
              },
            ]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
