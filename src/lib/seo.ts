import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * 静的ページ用の metadata を組み立てる。
 *
 * - title はルートレイアウトの template("%s | 優待マッチ")が付くため、ここではサイト名を付けない
 *   (以前は各ページでも付けていて「〜 | 優待マッチ | 優待マッチ」と二重になっていた)。
 * - openGraph は親から浅くマージされるだけなので、url を各ページ自身の URL にしないと
 *   トップの og:url がそのまま継承される。siteName 等もここで毎回指定する。
 */
export function buildPageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  /** 先頭スラッシュ付きのパス(例: "/about") */
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const fullTitle = `${title} | ${siteConfig.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url,
    },
    twitter: { card: "summary", title: fullTitle, description },
  };
}
