import { MetadataRoute } from "next";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { EXPENSE_CATEGORY_SLUGS } from "@/lib/matching";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();

  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/onboarding`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/stocks`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
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

  const stockPages: MetadataRoute.Sitemap = YUTAI_LIST
    .filter((y) => y.annualValue > 0)
    .map((yutai) => ({
      url: `${baseUrl}/stocks/${yutai.code}`,
      lastModified: yutai.lastVerified ? new Date(yutai.lastVerified) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...corePages, ...expensePages, ...stockPages];
}
