import { MetadataRoute } from "next";
import { YUTAI_LIST } from "@/lib/yutai-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yutai-app-lyart.vercel.app";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/onboarding`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stocks`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const stockPages: MetadataRoute.Sitemap = YUTAI_LIST.filter(
    (y) => y.annualValue > 0
  ).map((yutai) => ({
    url: `${baseUrl}/stocks/${yutai.code}`,
    lastModified: yutai.lastVerified ? new Date(yutai.lastVerified) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...stockPages];
}
