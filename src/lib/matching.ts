import type { Yutai } from "./yutai-data";
import type { MatchResult, UserLifestyle } from "@/types/matching";

function generateMatchReason(
  matchedBrands: string[],
  matchedTags: string[]
): string {
  const brandText = matchedBrands.map((b) => `『${b}』`).join("");
  const tagText = matchedTags.map((t) => `『${t}』`).join("");

  if (matchedBrands.length > 0 && matchedTags.length > 0) {
    return `あなたが使う${brandText}に加え、${tagText}のライフスタイルにマッチ`;
  }
  if (matchedBrands.length > 0) {
    return `あなたが使う${brandText}の優待です`;
  }
  return `${tagText}のあなたに合う優待です`;
}

export function matchYutai(
  lifestyle: UserLifestyle,
  yutaiList: Yutai[]
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const yutai of yutaiList) {
    if (
      lifestyle.maxInvestment !== undefined &&
      yutai.approxInvestment > lifestyle.maxInvestment
    ) {
      continue;
    }

    const matchedBrands = yutai.brands.filter((brand) =>
      lifestyle.brands.includes(brand)
    );
    const matchedTags = yutai.lifestyleTags.filter((tag) =>
      lifestyle.lifestyleTags.includes(tag)
    );

    const score = Math.min(
      matchedBrands.length * 30 + matchedTags.length * 15,
      100
    );

    if (score <= 0) continue;

    results.push({
      yutai,
      score,
      matchedBrands,
      matchedTags,
      matchReason: generateMatchReason(matchedBrands, matchedTags),
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function getAllBrands(yutaiList: Yutai[]): string[] {
  const brands = new Set<string>();
  for (const yutai of yutaiList) {
    for (const brand of yutai.brands) {
      brands.add(brand);
    }
  }
  return Array.from(brands).sort();
}

export function getAllLifestyleTags(yutaiList: Yutai[]): string[] {
  const tags = new Set<string>();
  for (const yutai of yutaiList) {
    for (const tag of yutai.lifestyleTags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

export function getBrandRelevanceScore(
  brand: string,
  interests: string[],
  lifestyleTags: string[],
  yutaiList: Yutai[]
): number {
  const interestToCategoryMap: Record<string, string[]> = {
    "ガジェット・テクノロジー": ["家電", "通信", "EC", "IT"],
    "旅行・お出かけ": ["旅行", "航空", "交通", "ホテル", "リゾート"],
    "ファッション": ["ファッション"],
    "食事・グルメ": ["外食", "カフェ", "食品", "飲料"],
    "エンタメ(映画・テーマパーク)": ["エンタメ"],
    "健康・スポーツ": ["スポーツ", "アウトドア", "医療", "ドラッグストア"],
    "生活雑貨・日用品": ["日用品", "小売", "百貨店", "雑貨"],
    "子育て・ファミリー": ["エンタメ", "外食", "教育", "日用品"],
  };

  const targetCategories = new Set(
    interests.flatMap((i) => interestToCategoryMap[i] ?? [])
  );

  const relevantYutai = yutaiList.filter((y) => y.brands.includes(brand));

  let score = 0;
  for (const yutai of relevantYutai) {
    score += yutai.categories.filter((c) => targetCategories.has(c)).length * 10;
    score += yutai.lifestyleTags.filter((t) => lifestyleTags.includes(t)).length * 5;
  }
  return score;
}

export function groupBrandsByCategory(yutaiList: Yutai[]): Record<string, string[]> {
  const categoryToBrands: Record<string, Set<string>> = {};
  for (const yutai of yutaiList) {
    const primaryCategory = yutai.categories[0];
    if (!categoryToBrands[primaryCategory]) {
      categoryToBrands[primaryCategory] = new Set();
    }
    for (const brand of yutai.brands) {
      categoryToBrands[primaryCategory].add(brand);
    }
  }
  const result: Record<string, string[]> = {};
  for (const [cat, brands] of Object.entries(categoryToBrands)) {
    result[cat] = Array.from(brands).sort();
  }
  return result;
}

export type ExpenseCategory =
  | "食費(外食・自炊・カフェ)"
  | "通信費(スマホ・ネット)"
  | "交通費(電車・新幹線・飛行機)"
  | "車関連費(ガソリン・駐車場・整備)"
  | "電気・ガス代"
  | "子育て・教育費"
  | "ファッション・美容"
  | "旅行・レジャー"
  | "エンタメ(映画・テーマパーク・サブスク)"
  | "健康・スポーツ(ジム・サプリ)"
  | "日用品(ドラッグストア・スーパー)"
  | "趣味(ガジェット・読書・ペット)"
  | "ネットショッピング(楽天・Yahoo!等)";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "食費(外食・自炊・カフェ)",
  "通信費(スマホ・ネット)",
  "交通費(電車・新幹線・飛行機)",
  "車関連費(ガソリン・駐車場・整備)",
  "電気・ガス代",
  "子育て・教育費",
  "ファッション・美容",
  "旅行・レジャー",
  "エンタメ(映画・テーマパーク・サブスク)",
  "健康・スポーツ(ジム・サプリ)",
  "日用品(ドラッグストア・スーパー)",
  "趣味(ガジェット・読書・ペット)",
  "ネットショッピング(楽天・Yahoo!等)",
];

export const expenseToYutaiMatch: Record<
  ExpenseCategory,
  { categories: string[]; tags: string[] }
> = {
  "食費(外食・自炊・カフェ)": {
    categories: ["外食", "カフェ", "食品"],
    tags: ["外食月3回以上", "自炊する", "ファミリー外食", "カフェよく利用", "一人ランチ"],
  },
  "通信費(スマホ・ネット)": {
    categories: ["通信"],
    tags: ["通信費を抑えたい"],
  },
  "交通費(電車・新幹線・飛行機)": {
    categories: ["交通", "航空"],
    tags: ["電車通勤", "新幹線通勤", "出張多い", "国内旅行派", "海外旅行派"],
  },
  "車関連費(ガソリン・駐車場・整備)": {
    categories: ["自動車"],
    tags: ["車所有", "ドライブ好き"],
  },
  "電気・ガス代": {
    categories: ["公益"],
    tags: [],
  },
  "子育て・教育費": {
    categories: ["教育", "エンタメ"],
    tags: ["子育て中", "教育熱心", "ファミリー"],
  },
  "ファッション・美容": {
    categories: ["ファッション"],
    tags: ["ファッション好き", "ビジネスカジュアル", "コーディネートこだわり", "美容ケア"],
  },
  "旅行・レジャー": {
    categories: ["旅行", "ホテル", "リゾート"],
    tags: ["国内旅行派", "海外旅行派", "リゾート好き", "温泉好き"],
  },
  "エンタメ(映画・テーマパーク・サブスク)": {
    categories: ["エンタメ"],
    tags: ["映画よく見る", "テーマパーク好き", "デート"],
  },
  "健康・スポーツ(ジム・サプリ)": {
    categories: ["スポーツ", "アウトドア", "医療", "ドラッグストア"],
    tags: ["スポーツする", "健康意識高い", "ゴルフ好き", "キャンプ好き"],
  },
  "日用品(ドラッグストア・スーパー)": {
    categories: ["日用品", "ドラッグストア", "小売"],
    tags: ["日用品まとめ買い", "コスパ志向"],
  },
  "趣味(ガジェット・読書・ペット)": {
    categories: ["家電", "雑貨"],
    tags: ["ガジェット好き", "ペット飼育", "家電購入予定"],
  },
  "ネットショッピング(楽天・Yahoo!等)": {
    categories: ["EC"],
    tags: ["ネットショッピング多用", "楽天経済圏", "PayPayユーザー"],
  },
};

export type UserExpenseLifestyle = {
  expenseCategories: ExpenseCategory[];
  brands: string[];
  maxInvestment?: number;
};

export type MatchResultV2 = {
  yutai: Yutai;
  score: number;
  matchedExpenseCategories: ExpenseCategory[];
  matchedBrands: string[];
  annualSavings: number;
  matchReason: string;
};

function generateExpenseMatchReason(
  expenses: ExpenseCategory[],
  brands: string[],
  yutai: Yutai
): string {
  const expenseText =
    expenses.length > 0
      ? `あなたの「${expenses.join("・")}」を削減`
      : "";
  const brandText =
    brands.length > 0
      ? `あなたが使う『${brands.join("』『")}』に対応`
      : "";
  if (expenseText && brandText) return `${expenseText}。${brandText}`;
  return expenseText || brandText || `${yutai.name}の優待`;
}

export function matchYutaiByExpense(
  lifestyle: UserExpenseLifestyle,
  yutaiList: Yutai[]
): MatchResultV2[] {
  const results: MatchResultV2[] = [];

  for (const yutai of yutaiList) {
    if (yutai.annualValue <= 0) continue;

    if (
      lifestyle.maxInvestment &&
      yutai.approxInvestment > lifestyle.maxInvestment
    ) {
      continue;
    }

    const matchedExpenses: ExpenseCategory[] = [];
    let score = 0;

    for (const expense of lifestyle.expenseCategories) {
      const mapping = expenseToYutaiMatch[expense];
      const catMatch = yutai.categories.some((c) =>
        mapping.categories.includes(c)
      );
      const tagMatch = yutai.lifestyleTags.some((t) =>
        mapping.tags.includes(t)
      );
      if (catMatch || tagMatch) {
        matchedExpenses.push(expense);
        score += catMatch ? 30 : 0;
        score += tagMatch ? 15 : 0;
      }
    }

    const matchedBrands = yutai.brands.filter((b) =>
      lifestyle.brands.includes(b)
    );
    score += matchedBrands.length * 30;

    if (score === 0) continue;
    if (score > 100) score = 100;

    results.push({
      yutai,
      score,
      matchedExpenseCategories: matchedExpenses,
      matchedBrands,
      annualSavings: yutai.annualValue,
      matchReason: generateExpenseMatchReason(matchedExpenses, matchedBrands, yutai),
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

// ── 使用例 ──────────────────────────────────────────────────────
//
// 例1: 楽天ユーザー → 楽天グループだけマッチ
// matchYutai(
//   { brands: ["楽天市場", "楽天モバイル"], lifestyleTags: [] },
//   YUTAI_LIST
// );
// → [{ yutai: 楽天グループ, score: 60, matchedBrands: ["楽天市場", "楽天モバイル"],
//       matchReason: "あなたが使う『楽天市場』『楽天モバイル』の優待です" }]
//
// 例2: 国内旅行 + 車所有 → リゾートトラスト・ENEOS等がマッチ
// matchYutai(
//   { brands: [], lifestyleTags: ["国内旅行派", "車所有"] },
//   YUTAI_LIST
// );
// → リゾートトラスト(score:30)、ANA HD(score:15)、JAL(score:15)、
//   ENEOS HD(score:15)、出光興産(score:15) などが返る
//
// 例3: maxInvestment 30万円 → 高額銘柄は除外
// matchYutai(
//   { brands: ["楽天市場"], lifestyleTags: ["国内旅行派"], maxInvestment: 300000 },
//   YUTAI_LIST
// );
// → approxInvestment > 300000 の王将フードサービス・KDDI・日清食品HD等は除外される
