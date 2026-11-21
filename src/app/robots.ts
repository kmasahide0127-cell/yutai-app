import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// AI の学習・回答用に巡回するロボット。サイトの集客や広告審査には関係せず、
// 全ページを高頻度で取得して Vercel の転送量(無料枠)を消費するため巡回を断る。
// Google 検索(Googlebot)と AdSense の確認用ロボット(Mediapartners-Google)は含めない。
// 利用者の指示でその場で1ページだけ取得するもの(ChatGPT-User 等)は巡回ではないため含めない。
// AI 検索の結果に載せるための巡回(OAI-SearchBot・Claude-SearchBot)は、そこからの流入を残すため含めない。
// Google-Extended は Google の AI 学習への利用可否を示す名前で、検索の巡回・掲載には影響しない。
const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "PerplexityBot",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Diffbot",
  "ImagesiftBot",
  "Timpibot",
  "omgili",
  "YouBot",
  "AI2Bot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /_next/ はブロックしない。ページの描画に使う JS/CSS がここから配信されるため、
        // ブロックすると Google のクローラがページを正しくレンダリングできない。
        disallow: ["/api/"],
      },
      {
        userAgent: AI_CRAWLERS,
        disallow: "/",
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
