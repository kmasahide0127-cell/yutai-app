import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "あなたにマッチする優待",
  description: "毎月の出費から、削減できる株主優待を提案。あなたのライフスタイルにぴったりの優待が見つかります。",
  alternates: {
    canonical: "/results",
  },
  robots: {
    index: false,
    follow: true,
  },
};
import {
  matchYutaiByExpenseGrouped,
  buildCalendarPackage,
  filterCandidatesForBudget,
  buildBudgetPackage,
  isGasolineYutai,
  calculatePreferenceMatchScore,
  countYutaiByTag,
  PREFERENCE_TAGS,
  type ExpenseCategory,
  type CategoryGroup,
  type CalendarPackage,
  type BudgetPackage,
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
}>;

// 有効な PreferenceTag ID の集合(型ガード用)
const VALID_TAG_IDS = new Set(
  Object.values(PREFERENCE_TAGS).flat().map((t) => t.id)
);

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
  } = await searchParams;

  const expenseCategories = (
    expensesParam?.split(",").filter(Boolean) ?? []
  ) as ExpenseCategory[];
  const maxInvestment = maxParam ? parseInt(maxParam, 10) : undefined;
  const householdSize = householdParam ? Math.max(1, parseInt(householdParam, 10)) : 1;
  const vehicleType = (["gasoline", "ev", "none"].includes(vehicleTypeParam ?? "")
    ? vehicleTypeParam
    : null) as VehicleType;

  // 型ガードで不正値を除外
  const preferenceTags = (
    preferenceTagsParam?.split(",").filter(Boolean) ?? []
  ).filter((id): id is PreferenceTag => VALID_TAG_IDS.has(id as PreferenceTag));

  const lifestyle: UserExpenseLifestyle = { expenseCategories, brands: [], maxInvestment };

  const groupedMap = matchYutaiByExpenseGrouped(lifestyle, YUTAI_LIST);
  const calendarPackage: CalendarPackage = buildCalendarPackage(lifestyle, YUTAI_LIST);

  const defaultBudget = lifestyle.maxInvestment ?? 500000;
  const budgetCandidates = filterCandidatesForBudget(lifestyle, YUTAI_LIST);
  const initialBudgetPackage: BudgetPackage = buildBudgetPackage(lifestyle, budgetCandidates, defaultBudget);

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
          calendarPackage={calendarPackage}
          initialBudgetPackage={initialBudgetPackage}
          budgetCandidates={budgetCandidates}
          lifestyle={lifestyle}
          householdSize={householdSize}
          vehicleType={vehicleType}
          preferenceTags={preferenceTags}
          preferenceTagCounts={preferenceTagCounts}
        />
      </div>
    </div>
  );
}
