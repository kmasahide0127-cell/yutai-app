import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import {
  matchYutaiByExpenseGrouped,
  filterCandidatesForBudget,
  isGasolineYutai,
  calculatePreferenceMatchScore,
  countYutaiByTag,
  PREFERENCE_TAGS,
  type ExpenseCategory,
  type CategoryGroup,
  type UserExpenseLifestyle,
  type PreferenceTag,
} from "@/lib/matching";
import type { VehicleType } from "@/store/onboarding-store";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { ResultsClient } from "@/components/results/ResultsClient";

type SearchParams = Promise<{
  expenses?: string;
  maxInvestment?: string;
  household?: string;
  vehicleType?: string;
  preferenceTags?: string;
  totalBudget?: string;
  planYears?: string;
}>;

const BASE_URL = "https://yutai-match.com";

// 有効な PreferenceTag ID の集合(型ガード用)
const VALID_TAG_IDS = new Set(
  Object.values(PREFERENCE_TAGS).flat().map((t) => t.id)
);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const {
    expenses: expensesParam,
    maxInvestment: maxParam,
    household: householdParam,
    vehicleType: vehicleTypeParam,
    preferenceTags: preferenceTagsParam,
  } = await searchParams;

  const qp = new URLSearchParams();
  if (expensesParam) qp.set("expenses", expensesParam);
  if (maxParam) qp.set("maxInvestment", maxParam);
  if (householdParam) qp.set("household", householdParam);
  if (vehicleTypeParam) qp.set("vehicleType", vehicleTypeParam);
  if (preferenceTagsParam) qp.set("preferenceTags", preferenceTagsParam);
  const qpStr = qp.toString();
  const ogImageUrl = `${BASE_URL}/api/og${qpStr ? `?${qpStr}` : ""}`;

  return {
    title: "あなたにマッチする優待",
    description:
      "毎月の出費から、削減できる株主優待を提案。あなたのライフスタイルにぴったりの優待が見つかります。",
    alternates: { canonical: "/results" },
    robots: { index: false, follow: true },
    openGraph: {
      title: "私の年間優待カレンダー | 優待アプリ",
      description: "毎月の出費から、削減できる株主優待を提案。",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "私の年間優待カレンダー" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "私の年間優待カレンダー | 優待アプリ",
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
  const {
    expenses: expensesParam,
    maxInvestment: maxParam,
    household: householdParam,
    vehicleType: vehicleTypeParam,
    preferenceTags: preferenceTagsParam,
    totalBudget: totalBudgetParam,
    planYears: planYearsParam,
  } = await searchParams;

  const expenseCategories = (
    expensesParam?.split(",").filter(Boolean) ?? []
  ) as ExpenseCategory[];
  const maxInvestment = maxParam ? parseInt(maxParam, 10) : undefined;
  const householdSize = householdParam ? Math.max(1, parseInt(householdParam, 10)) : 1;
  const vehicleType = (["gasoline", "ev", "none"].includes(vehicleTypeParam ?? "")
    ? vehicleTypeParam
    : null) as VehicleType;

  // 長期プラン(任意): 総額・年数がともに有効な値の場合のみ有効化
  const parsedTotalBudget = totalBudgetParam ? parseInt(totalBudgetParam, 10) : null;
  const parsedPlanYears = planYearsParam ? parseInt(planYearsParam, 10) : null;
  const totalStockBudget =
    parsedTotalBudget && parsedTotalBudget > 0 ? parsedTotalBudget : null;
  const planYears =
    parsedPlanYears === 5 || parsedPlanYears === 10 ? parsedPlanYears : null;

  // 型ガードで不正値を除外
  const preferenceTags = (
    preferenceTagsParam?.split(",").filter(Boolean) ?? []
  ).filter((id): id is PreferenceTag => VALID_TAG_IDS.has(id as PreferenceTag));

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
  const qp = new URLSearchParams();
  if (expensesParam) qp.set("expenses", expensesParam);
  if (maxParam) qp.set("maxInvestment", maxParam);
  if (householdParam) qp.set("household", householdParam);
  if (vehicleTypeParam) qp.set("vehicleType", vehicleTypeParam);
  if (preferenceTagsParam) qp.set("preferenceTags", preferenceTagsParam);
  const qpString = qp.toString();
  const shareUrl = qpString ? `${BASE_URL}/results?${qpString}` : BASE_URL;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
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
