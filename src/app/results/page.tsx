import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import {
  matchYutaiByExpenseGrouped,
  filterCandidatesForBudget,
  isGasolineYutai,
  calculatePreferenceMatchScore,
  countYutaiByTag,
  type ExpenseCategory,
  type CategoryGroup,
  type UserExpenseLifestyle,
  type PreferenceTag,
} from "@/lib/matching";
import { parseResultParams, buildShareQuery, type RawResultParams } from "@/lib/result-params";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { ResultsClient } from "@/components/results/ResultsClient";
import { siteConfig } from "@/config/site";

type SearchParams = Promise<RawResultParams>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  // 未検証の値を OG 画像 URL に流さないよう、正規化済みの値だけで組み立てる。
  // 世帯人数は画像に影響せず、/api/og は正規化 URL 以外をリダイレクトするため含めない
  const qpStr = buildShareQuery({ ...parseResultParams(await searchParams), householdSize: 1 });
  const ogImageUrl = `${siteConfig.url}/api/og${qpStr ? `?${qpStr}` : ""}`;

  return {
    title: "あなたにマッチする優待",
    description:
      "毎月の出費から、削減できる株主優待を提案。あなたのライフスタイルにぴったりの優待が見つかります。",
    alternates: { canonical: "/results" },
    robots: { index: false, follow: true },
    // 他ページ(buildPageMetadata)と同じく url 等を明示しないと、トップの og:url が継承される
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: siteConfig.name,
      url: `${siteConfig.url}/results`,
      title: "私の年間優待カレンダー | 優待マッチ",
      description: "毎月の出費から、削減できる株主優待を提案。",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "私の年間優待カレンダー" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "私の年間優待カレンダー | 優待マッチ",
      description: "毎月の出費から、削減できる株主優待を提案。",
      images: [ogImageUrl],
    },
  };
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = parseResultParams(await searchParams);
  const {
    expenseCategories,
    maxInvestment,
    householdSize,
    vehicleType,
    preferenceTags,
    totalStockBudget,
    planYears,
  } = params;

  const lifestyle: UserExpenseLifestyle = { expenseCategories, brands: [], maxInvestment };

  const groupedMap = matchYutaiByExpenseGrouped(lifestyle, YUTAI_LIST);
  const budgetCandidates = filterCandidatesForBudget(lifestyle, YUTAI_LIST);

  // タグごとの該当銘柄数を事前計算(「限定的です」表示用)
  const preferenceTagCounts: Partial<Record<PreferenceTag, number>> = {};
  for (const tag of preferenceTags) {
    preferenceTagCounts[tag] = countYutaiByTag(tag, YUTAI_LIST);
  }

  // Map → 配列変換。EV ユーザーはガソリン給油系を除外。
  const CAR_CATEGORY = "車関連費(ガソリン・駐車場・整備)" as ExpenseCategory;
  const baseGroupedResults: CategoryGroup[] = expenseCategories.map((cat) => {
    const results = groupedMap.get(cat) ?? [];
    if (vehicleType === "ev" && cat === CAR_CATEGORY) {
      return { category: cat, results: results.filter((r) => !isGasolineYutai(r.yutai)) };
    }
    return { category: cat, results };
  });

  // preferenceTags がある場合のみ並び替え(後方互換: 空なら従来通り)
  const groupedResults: CategoryGroup[] =
    preferenceTags.length > 0
      ? baseGroupedResults.map(({ category, results }) => ({
          category,
          results: [...results].sort((a, b) => {
            const sA = calculatePreferenceMatchScore(a.yutai, preferenceTags).score;
            const sB = calculatePreferenceMatchScore(b.yutai, preferenceTags).score;
            if (sB !== sA) return sB - sA;
            return b.annualSavings - a.annualSavings;
          }),
        }))
      : baseGroupedResults;

  // 診断条件を含む結果URLを SSR で確定させる（ドメイン統一 + hydrationズレ防止のため案1採用）
  const qpString = buildShareQuery(params);
  const shareUrl = qpString ? `${siteConfig.url}/results?${qpString}` : siteConfig.url;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <header>
          <h1 className="text-2xl font-bold">あなたの生活にマッチした優待</h1>
        </header>

        <ResultsClient
          groupedResults={groupedResults}
          expenseCategoryCount={expenseCategories.length}
          budgetCandidates={budgetCandidates}
          investmentLimit={lifestyle.maxInvestment ?? 500000}
          householdSize={householdSize}
          vehicleType={vehicleType}
          preferenceTags={preferenceTags}
          preferenceTagCounts={preferenceTagCounts}
          shareUrl={shareUrl}
          totalStockBudget={totalStockBudget}
          planYears={planYears}
        />
      </div>
    </div>
  );
}
