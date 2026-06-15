import type { Yutai } from "./yutai-data";
import { YUTAI_LIST } from "./yutai-data";

// ── 型定義 ────────────────────────────────────────────────────────

export type ResolvedHolding = {
  input: string;
  found: boolean;
  yutai: Yutai | null;
};

// ── 銘柄解決 ──────────────────────────────────────────────────────

/**
 * 入力文字列(コード or 名前)を242銘柄DBと照合する。
 * DBにない銘柄(優待なし株・未収録株)は found: false として正直に返す。
 * コード完全一致 → 名前部分一致の順で検索し、最初にマッチした1件を採用。
 */
export function resolveHoldings(inputs: string[]): ResolvedHolding[] {
  return inputs.map((input) => {
    const trimmed = input.trim();
    if (!trimmed) return { input: trimmed, found: false, yutai: null };

    // 1. 証券コード完全一致
    const byCode = YUTAI_LIST.find((y) => y.code === trimmed);
    if (byCode) return { input: trimmed, found: true, yutai: byCode };

    // 2. 名前部分一致(大文字小文字区別なし)
    const lower = trimmed.toLowerCase();
    const byName = YUTAI_LIST.find((y) => y.name.toLowerCase().includes(lower));
    if (byName) return { input: trimmed, found: true, yutai: byName };

    // 3. DBにない銘柄 — 知ったかぶりをしない
    return { input: trimmed, found: false, yutai: null };
  });
}

// ── 軸1: 権利確定月の穴 ───────────────────────────────────────────

export type RightsMonthGapAnalysis = {
  coveredMonths: number[];
  emptyMonths: number[];
};

export function analyzeRightsMonthGaps(
  holdings: ResolvedHolding[]
): RightsMonthGapAnalysis {
  const coveredSet = new Set<number>();

  for (const h of holdings) {
    if (!h.found || !h.yutai) continue;
    for (const m of h.yutai.rightsMonths) {
      coveredSet.add(m);
    }
  }

  const coveredMonths = Array.from(coveredSet).sort((a, b) => a - b);
  const emptyMonths: number[] = [];
  for (let m = 1; m <= 12; m++) {
    if (!coveredSet.has(m)) emptyMonths.push(m);
  }

  return { coveredMonths, emptyMonths };
}

// ── 軸2: ジャンルの偏り ───────────────────────────────────────────

export type CategoryBiasAnalysis = {
  dominantCategories: { category: string; count: number }[];
  missingCategories: string[];
};

export function analyzeCategoryBias(
  holdings: ResolvedHolding[]
): CategoryBiasAnalysis {
  const categoryCount = new Map<string, number>();

  for (const h of holdings) {
    if (!h.found || !h.yutai) continue;
    for (const cat of h.yutai.categories) {
      categoryCount.set(cat, (categoryCount.get(cat) ?? 0) + 1);
    }
  }

  // DBに存在する全カテゴリを集計(ベースラインとして使用)
  const allCategories = new Set<string>();
  for (const y of YUTAI_LIST) {
    for (const cat of y.categories) {
      allCategories.add(cat);
    }
  }

  const dominantCategories = Array.from(categoryCount.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const missingCategories = Array.from(allCategories)
    .filter((cat) => !categoryCount.has(cat))
    .sort();

  return { dominantCategories, missingCategories };
}

// ── 軸3: 重複・非効率の指摘 ──────────────────────────────────────

export type RedundancyAnalysis = {
  redundantGroups: { category: string; yutaiNames: string[] }[];
};

export function analyzeRedundancy(
  holdings: ResolvedHolding[]
): RedundancyAnalysis {
  const categoryToNames = new Map<string, string[]>();

  for (const h of holdings) {
    if (!h.found || !h.yutai) continue;
    for (const cat of h.yutai.categories) {
      if (!categoryToNames.has(cat)) categoryToNames.set(cat, []);
      categoryToNames.get(cat)!.push(h.yutai.name);
    }
  }

  const redundantGroups = Array.from(categoryToNames.entries())
    .filter(([, names]) => names.length >= 2)
    .map(([category, yutaiNames]) => ({ category, yutaiNames }))
    .sort((a, b) => b.yutaiNames.length - a.yutaiNames.length);

  return { redundantGroups };
}

// ── 穴埋め提案 ───────────────────────────────────────────────────

export type GapSuggestions = {
  forEmptyMonths: { month: number; suggestions: Yutai[] }[];
  forMissingCategories: { category: string; suggestions: Yutai[] }[];
};

/**
 * 保有銘柄で埋まっていない月・カテゴリに対して候補銘柄を提案する。
 * 既に保有している銘柄は提案から除外。
 * 年間優待価値(annualValue)降順で上位3件ずつ返す。
 */
export function suggestForGaps(
  holdings: ResolvedHolding[],
  allYutai: Yutai[]
): GapSuggestions {
  const heldCodes = new Set(
    holdings
      .filter((h) => h.found && h.yutai)
      .map((h) => h.yutai!.code)
  );

  const monthGaps = analyzeRightsMonthGaps(holdings);
  const categoryBias = analyzeCategoryBias(holdings);

  // 未保有かつ優待価値あり
  const available = allYutai.filter(
    (y) => !heldCodes.has(y.code) && y.annualValue > 0
  );

  const forEmptyMonths = monthGaps.emptyMonths.map((month) => ({
    month,
    suggestions: available
      .filter((y) => y.rightsMonths.includes(month))
      .sort((a, b) => b.annualValue - a.annualValue)
      .slice(0, 3),
  }));

  const forMissingCategories = categoryBias.missingCategories.map((category) => ({
    category,
    suggestions: available
      .filter((y) => y.categories.includes(category))
      .sort((a, b) => b.annualValue - a.annualValue)
      .slice(0, 3),
  }));

  return { forEmptyMonths, forMissingCategories };
}
