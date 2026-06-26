const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yutai-match.com";

export const siteConfig = {
  name: "優待マッチ",
  url: BASE_URL,
  description: "毎月の出費から、生活に合う株主優待を提案する生活逆引き型マッチングアプリ。個人開発・情報提供サービス。",
  ogImage: `${BASE_URL}/og-image.png`,
} as const;
