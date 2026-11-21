import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { siteConfig } from "@/config/site";
import { DATA_LAST_UPDATED } from "@/lib/yutai-data";
import { GUIDES, getGuide } from "@/lib/guides";
import { serializeJsonLd } from "@/lib/utils";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

/** ガイド記事の共通枠(パンくず・見出し・更新日・関連記事・注意事項・構造化データ) */
export function GuideArticle({ slug, children }: { slug: string; children: React.ReactNode }) {
  const guide = getGuide(slug);
  const others = GUIDES.filter((g) => g.slug !== slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: "2026-11-18",
    dateModified: guide.updated,
    inLanguage: "ja-JP",
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}/guide/${slug}` },
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <article className="mx-auto max-w-2xl min-w-0 space-y-8 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <Link href="/guide" className="hover:underline">ガイド</Link>
          <span className="mx-2">›</span>
          <span>{guide.title.split(" — ")[0]}</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug">{guide.title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{guide.description}</p>
          <p className="text-xs text-muted-foreground">
            記事の更新日: {formatDate(guide.updated)} / 記事中の件数・金額は掲載データ(データ取得日 {formatDate(DATA_LAST_UPDATED)})から算出
          </p>
        </header>

        {children}

        <section className="space-y-2" aria-labelledby="other-guides-heading">
          <h2 id="other-guides-heading" className="text-base font-bold">ほかのガイド</h2>
          <ul className="space-y-1.5 text-sm">
            {others.map((g) => (
              <li key={g.slug}>
                <Link prefetch={false} href={`/guide/${g.slug}`} className="text-primary underline">{g.title}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>
            ※ 本記事は株主優待の仕組みと当サイトの掲載データについての情報提供であり、特定の銘柄の売買を勧めるものではありません。
            記事中の銘柄は説明のための実例です。投資判断はご自身の責任でお願いします(<Link href="/terms" className="underline">利用規約</Link>)。
          </p>
          <p>※ 優待の内容は変更・廃止されることがあります。最新の内容は各企業のIRページで確認してください。</p>
        </section>
      </article>
    </div>
  );
}

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 text-lg font-bold">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3" aria-labelledby={id}>
      <H2 id={id}>{title}</H2>
      {children}
    </section>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}

export function StockLink({ code, name }: { code: string; name: string }) {
  return (
    <Link prefetch={false} href={`/stocks/${code}`} className="text-primary underline">
      {name}({code})
    </Link>
  );
}
