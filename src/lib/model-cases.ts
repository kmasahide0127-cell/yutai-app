// 組み合わせ例(参考)用の代表的な生活パターンと、その診断結果の算出。
//
// 診断結果ページ(/results)と同じ関数(filterCandidatesForBudget → buildBudgetAwareCalendarPackage)を
// そのまま呼ぶ。ここで独自の選び方をすると「実際の診断ではこうならない」例になってしまうため。
// /model-cases(noindex・ナビ未リンク)と docs/model-cases-draft.md の生成で共用する。

import {
  buildBudgetAwareCalendarPackage,
  filterCandidatesForBudget,
  type ExpenseCategory,
  type PreferenceTag,
} from "./matching";
import { YUTAI_LIST, type Yutai } from "./yutai-data";

export type ModelCaseInput = {
  id: string;
  label: string;
  expenseCategories: ExpenseCategory[];
  /** 今年度、優待に使える予算(円)。/results の予算初期値と同じ扱い */
  budget: number;
  /** 世帯人数。カレンダーの組み立てには影響しない(家族分散の表示にのみ使う) */
  householdSize: number;
  preferenceTags: PreferenceTag[];
};

export const MODEL_CASES: ModelCaseInput[] = [
  {
    id: "eating-out-2p-100man",
    label: "外食中心・2人世帯・今年100万円",
    expenseCategories: ["外食・カフェ"],
    budget: 1_000_000,
    householdSize: 2,
    preferenceTags: [],
  },
  {
    id: "family-4p-50man",
    label: "子育て中・4人世帯・今年50万円",
    expenseCategories: ["子育て・教育", "外食・カフェ"],
    budget: 500_000,
    householdSize: 4,
    preferenceTags: ["family-restaurant"],
  },
  {
    id: "fixed-cost-1p-30man",
    label: "通信費・交通費を抑えたい単身・今年30万円",
    expenseCategories: ["通信費", "交通・旅行"],
    budget: 300_000,
    householdSize: 1,
    preferenceTags: [],
  },
  {
    id: "daily-beauty-2p-50man",
    label: "日用品・美容が中心・2人世帯・今年50万円",
    expenseCategories: ["日用品・ドラッグストア", "美容・スキンケア"],
    budget: 500_000,
    householdSize: 2,
    preferenceTags: [],
  },
];

export type ModelCaseResult = {
  input: ModelCaseInput;
  /** 組み合わせ(銘柄ごと、権利確定月つき) */
  picks: Array<{ yutai: Yutai; months: number[] }>;
  coveredMonths: number[];
  emptyMonths: number[];
  totalInvestment: number;
  totalAnnualValue: number;
  yieldPercent: number;
  candidateCount: number;
};

export function runModelCase(input: ModelCaseInput, yutaiList: Yutai[] = YUTAI_LIST): ModelCaseResult {
  const candidates = filterCandidatesForBudget(
    { expenseCategories: input.expenseCategories, brands: [], maxInvestment: input.budget },
    yutaiList
  );
  const cal = buildBudgetAwareCalendarPackage(candidates, input.budget, input.preferenceTags, []);

  const byCode = new Map<string, { yutai: Yutai; months: number[] }>();
  for (const { month, yutai } of cal.confirmed) {
    const entry = byCode.get(yutai.code) ?? { yutai, months: [] };
    entry.months.push(month);
    byCode.set(yutai.code, entry);
  }
  const coveredMonths = Array.from(new Set(cal.confirmed.map((c) => c.month))).sort((a, b) => a - b);
  const emptyMonths = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => !coveredMonths.includes(m));

  return {
    input,
    picks: Array.from(byCode.values()).sort((a, b) => a.months[0] - b.months[0]),
    coveredMonths,
    emptyMonths,
    totalInvestment: cal.confirmedTotalInvestment,
    totalAnnualValue: cal.confirmedAnnualValue,
    yieldPercent: Math.round(cal.confirmedYield * 10) / 10,
    candidateCount: candidates.length,
  };
}
