import { MetadataRoute } from "next";
import { YUTAI_LIST, hasActiveYutai, isAbolishedYutai } from "@/lib/yutai-data";
import { EXPENSE_CATEGORY_SLUGS } from "@/lib/matching";
import { siteConfig } from "@/config/site";
import { GUIDES } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // /onboarding は入力画面で、サーバーが返すHTMLは「読み込み中...」のみ(状態の復元後に描画する)。
  // 本文のないページを sitemap に載せないため除外する(ページ自体は全ページのヘッダーから辿れる)。
  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/expense`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/stocks`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/experiences`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/method`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const expensePages: MetadataRoute.Sitemap = Object.values(EXPENSE_CATEGORY_SLUGS).map((slug) => ({
    url: `${baseUrl}/expense/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 廃止銘柄の詳細ページも「廃止された」事実を伝える価値があるため含める
  const stockPages: MetadataRoute.Sitemap = YUTAI_LIST
    .filter((y) => hasActiveYutai(y) || isAbolishedYutai(y))
    .map((yutai) => ({
      url: `${baseUrl}/stocks/${yutai.code}`,
      lastModified: yutai.lastVerified ? new Date(yutai.lastVerified) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${baseUrl}/guide/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...corePages, ...guidePages, ...expensePages, ...stockPages];
}

// output: "export"(Cloudflare Pages 向け静的書き出し)ではメタデータルートの静的指定が必須
export const dynamic = "force-static";
