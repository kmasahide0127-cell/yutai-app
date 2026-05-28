import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YUTAI_LIST } from "@/lib/yutai-data";
import {
  EXPENSE_CATEGORY_SLUGS,
  getExpenseCategoryBySlug,
  getYutaiForExpenseCategory,
} from "@/lib/matching";
import { AppHeader } from "@/components/AppHeader";
import { buttonVariants } from "@/components/ui/button";

export async function generateStaticParams() {
  return Object.values(EXPENSE_CATEGORY_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const expense = getExpenseCategoryBySlug(slug);
  if (!expense) return { title: "カテゴリが見つかりません" };

  const description = `${expense}の出費を株主優待で削減する方法。${expense}に使えるおすすめ優待銘柄を年間価値の高い順に紹介。あなたに合う優待を無料診断できます。`;

  return {
    title: `${expense}に使える株主優待 - 出費を優待で削減`,
    description,
    alternates: { canonical: `/expense/${slug}` },
    openGraph: {
      title: `${expense}に使える株主優待`,
      description,
      url: `https://yutai-app-lyart.vercel.app/expense/${slug}`,
      type: "article",
    },
    twitter: { card: "summary", title: `${expense}に使える株主優待`, description },
  };
}

function formatYen(amount: number): string {
  return `${amount.toLocaleString()}円`;
}

export default async function ExpenseCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expense = getExpenseCategoryBySlug(slug);
  if (!expense) notFound();

  const yutaiList = getYutaiForExpenseCategory(expense, YUTAI_LIST, 20);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${expense}に使える株主優待`,
    description: `${expense}の出費を削減できる株主優待の一覧`,
    inLanguage: "ja-JP",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <span>{expense}の優待</span>
        </nav>

        <header className="space-y-2">
          <h1 className="text-2xl font-bold">{expense}に使える株主優待</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {expense}の出費は、株主優待で削減できます。
            ここでは{expense}に活用できる優待銘柄を、年間優待価値の高い順に紹介します。
          </p>
        </header>

        {/* CTA(上部) */}
        <section className="rounded-xl border-2 border-primary bg-primary text-primary-foreground p-5 text-center space-y-3">
          <h2 className="text-lg font-bold">あなたにぴったりの優待を診断</h2>
          <p className="text-sm opacity-90">
            {expense}を含む、あなたの生活全体から最適な優待を無料で診断します(1分)
          </p>
          <Link href="/onboarding" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            無料で診断する
          </Link>
        </section>

        {/* 銘柄リスト */}
        {yutaiList.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-base font-bold">{expense}におすすめの優待銘柄({yutaiList.length}件)</h2>
            <div className="space-y-2">
              {yutaiList.map((yutai, idx) => (
                <Link
                  key={yutai.id}
                  href={`/stocks/${yutai.code}`}
                  className="block rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-muted-foreground tabular-nums shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{yutai.name}</p>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">({yutai.code})</span>
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                        年間 {formatYen(yutai.annualValue)} / 必要投資 {formatYen(yutai.approxInvestment)} / 利回り {yutai.yieldPercent}%
                      </p>
                      {yutai.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{yutai.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              現在、{expense}に該当する優待銘柄は準備中です。
              <Link href="/onboarding" className="underline font-medium">診断</Link>で他のカテゴリも試してみてください。
            </p>
          </section>
        )}

        {/* 他カテゴリへの導線 */}
        <section className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-base font-bold">他の出費カテゴリも見る</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EXPENSE_CATEGORY_SLUGS)
              .filter(([cat]) => cat !== expense)
              .map(([cat, s]) => (
                <Link
                  key={s}
                  href={`/expense/${s}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border bg-card text-xs hover:bg-muted/50 transition-colors"
                >
                  {cat}
                </Link>
              ))}
          </div>
        </section>

        {/* 免責 */}
        <section className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
          <p>※ 優待情報は2026年5月27日時点のものです。最新情報は各企業のIRページでご確認ください。</p>
          <p>※ 本サイトの情報は投資勧誘ではありません。投資判断はご自身の責任でお願いします。</p>
        </section>
      </div>
    </div>
  );
}
