"use client";

import { useSearchParams } from "next/navigation";
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
import { parseResultParams, buildShareQuery } from "@/lib/result-params";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { ResultsClient } from "@/components/results/ResultsClient";
import { siteConfig } from "@/config/site";

/**
 * /results?expenses=…&maxInvestment=… をブラウザで読み、マッチング結果を計算して表示する。
 * ページは静的生成し、診断条件ごとにサーバーでページを作らない(Vercel の Fast Origin Transfer を抑えるため)。
 * クエリは誰でも組み立てられるため、従来どおり parseResultParams で許可値に正規化してから使う。
 */
export function ResultsFromQuery() {
  const searchParams = useSearchParams();
  const params = parseResultParams({
    expenses: searchParams.get("expenses") ?? undefined,
    maxInvestment: searchParams.get("maxInvestment") ?? undefined,
    household: searchParams.get("household") ?? undefined,
    vehicleType: searchParams.get("vehicleType") ?? undefined,
    preferenceTags: searchParams.get("preferenceTags") ?? undefined,
    totalBudget: searchParams.get("totalBudget") ?? undefined,
    planYears: searchParams.get("planYears") ?? undefined,
  });
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

  // シェア URL は正規化済みの値だけで組み立て、ドメインは siteConfig に統一する
  const qpString = buildShareQuery(params);
  const shareUrl = qpString ? `${siteConfig.url}/results?${qpString}` : siteConfig.url;

  return (
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
  );
}
