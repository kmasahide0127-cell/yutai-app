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
  | "外食・カフェ"
  | "自炊・食材"
  | "コンビニ・お菓子"
  | "日用品・ドラッグストア"
  | "衣服・ファッション"
  | "美容・スキンケア"
  | "通信費"
  | "車関連費(ガソリン・駐車場・整備)"
  | "交通・旅行"
  | "エンタメ(映画・テーマパーク)"
  | "健康・スポーツ"
  | "子育て・教育"
  | "趣味・ガジェット"
  | "ネットショッピング";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "外食・カフェ",
  "自炊・食材",
  "コンビニ・お菓子",
  "日用品・ドラッグストア",
  "衣服・ファッション",
  "美容・スキンケア",
  "通信費",
  "車関連費(ガソリン・駐車場・整備)",
  "交通・旅行",
  "エンタメ(映画・テーマパーク)",
  "健康・スポーツ",
  "子育て・教育",
  "趣味・ガジェット",
  "ネットショッピング",
];

export const expenseToYutaiMatch: Record<
  ExpenseCategory,
  { categories: string[]; tags: string[] }
> = {
  "外食・カフェ": {
    categories: ["外食", "カフェ"],
    tags: ["外食月3回以上", "ファミリー外食", "カフェよく利用", "一人ランチ", "居酒屋好き", "焼肉好き", "ラーメン好き", "寿司好き", "和食好き", "ステーキ好き", "デート", "記念日外食", "朝活", "モーニング", "ノマドワーク"],
  },
  "自炊・食材": {
    categories: ["食品", "飲料", "小売"],
    tags: ["自炊する", "ファミリー", "晩酌する", "ビール好き", "野菜不足", "ストック食料"],
  },
  "コンビニ・お菓子": {
    categories: ["食品", "小売"],
    tags: ["コンビニよく利用", "セブン-イレブン利用", "お菓子好き", "おみやげ", "プレゼント購入"],
  },
  "日用品・ドラッグストア": {
    categories: ["日用品", "ドラッグストア", "小売"],
    tags: ["日用品まとめ買い", "コスパ志向", "ウエル活"],
  },
  "衣服・ファッション": {
    categories: ["ファッション"],
    tags: ["ファッション好き", "ビジネスカジュアル", "コーディネートこだわり", "スーツ着用", "コスパ重視ファッション", "若者ファッション", "スニーカー好き"],
  },
  "美容・スキンケア": {
    categories: ["美容", "化粧品", "ドラッグストア"],
    tags: ["美容ケア", "化粧品愛用", "美容意識高い", "ヘアケア", "敏感肌", "メンズスキンケア"],
  },
  "通信費": {
    categories: ["通信"],
    tags: ["通信費を抑えたい", "固定費を抑えたい", "auユーザー", "PayPayユーザー", "ドコモユーザー", "楽天経済圏"],
  },
  "車関連費(ガソリン・駐車場・整備)": {
    categories: ["自動車", "エネルギー"],
    tags: ["車所有", "ドライブ好き", "中古車購入", "EV所有"],
  },
  "交通・旅行": {
    categories: ["交通", "航空", "旅行", "ホテル", "リゾート"],
    tags: ["電車通勤", "新幹線通勤", "出張多い", "国内旅行派", "海外旅行派", "ANAマイラー", "JALマイラー", "リゾート好き", "温泉好き", "高級ホテル"],
  },
  "エンタメ(映画・テーマパーク)": {
    categories: ["エンタメ"],
    tags: ["映画よく見る", "テーマパーク好き", "デート", "スポーツ観戦", "動画視聴", "ゲーム好き"],
  },
  "健康・スポーツ": {
    categories: ["スポーツ", "アウトドア", "医療", "ドラッグストア"],
    tags: ["スポーツする", "健康意識高い", "ゴルフ好き", "キャンプ好き", "ジム通い", "アウトドア", "テニス好き", "バドミントン好き", "スキー好き", "視力ケア", "コンタクト利用"],
  },
  "子育て・教育": {
    categories: ["教育", "エンタメ", "外食", "小売", "ファッション"],
    tags: ["子育て中", "教育熱心", "ファミリー", "新生児", "ファミリー外食", "ファミリーショッピング"],
  },
  "趣味・ガジェット": {
    categories: ["家電", "雑貨", "IT", "サービス"],
    tags: ["ガジェット好き", "ペット飼育", "家電購入予定", "カメラ好き", "文具好き", "在宅勤務多め", "持ち家", "インテリア好き", "新生活", "ガーデニング", "DIY", "家計簿", "資産管理", "確定申告", "投資する", "ネット証券利用", "シンプル志向", "中古品"],
  },
  "ネットショッピング": {
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
    let hasCatMatch = false;
    let hasTagMatch = false;

    for (const expense of lifestyle.expenseCategories) {
      const mapping = expenseToYutaiMatch[expense as ExpenseCategory];
      if (!mapping) continue; // 旧カテゴリのURLパラメータへの防御
      const catMatch = yutai.categories.some((c) => mapping.categories.includes(c));
      const tagMatch = yutai.lifestyleTags.some((t) => mapping.tags.includes(t));
      if (catMatch || tagMatch) {
        matchedExpenses.push(expense);
        if (catMatch) hasCatMatch = true;
        if (tagMatch) hasTagMatch = true;
      }
    }

    const matchedBrands = yutai.brands.filter((b) => lifestyle.brands.includes(b));

    if (!hasCatMatch && !hasTagMatch && matchedBrands.length === 0) continue;

    // スコアリング: 年間優待価値の高さと投資しやすさを最重視
    let score = Math.min(yutai.annualValue / 500, 60); // 30,000円で60点満点
    if (yutai.approxInvestment <= 100000) score += 20;
    else if (yutai.approxInvestment <= 300000) score += 15;
    else if (yutai.approxInvestment <= 500000) score += 10;
    else if (yutai.approxInvestment <= 1000000) score += 5;
    if (hasCatMatch) score += 20;
    if (hasTagMatch) score += 10;
    score += matchedBrands.length * 10;

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

export type CategoryGroup = {
  category: ExpenseCategory;
  results: MatchResultV2[];
};

// 出費カテゴリ別にマッチング結果をグループ化。
// 各カテゴリで独立してランキングするため、低優待価値の銘柄も
// 関連カテゴリで確実に上位表示される。
export function matchYutaiByExpenseGrouped(
  lifestyle: UserExpenseLifestyle,
  yutaiList: Yutai[]
): Map<ExpenseCategory, MatchResultV2[]> {
  const result = new Map<ExpenseCategory, MatchResultV2[]>();

  for (const expense of lifestyle.expenseCategories) {
    const mapping = expenseToYutaiMatch[expense as ExpenseCategory];
    if (!mapping) continue; // 旧カテゴリのURLパラメータへの防御
    const matched: MatchResultV2[] = [];

    for (const yutai of yutaiList) {
      if (yutai.annualValue <= 0) continue;
      if (lifestyle.maxInvestment && yutai.approxInvestment > lifestyle.maxInvestment) continue;

      const catMatch = yutai.categories.some((c) => mapping.categories.includes(c));
      const tagMatch = yutai.lifestyleTags.some((t) => mapping.tags.includes(t));

      if (!catMatch && !tagMatch) continue;

      // カテゴリ内スコア: マッチ精度優先、次に優待価値と投資しやすさ
      let score = 0;
      if (catMatch) score += 40;
      if (tagMatch) score += 20;
      score += Math.min(yutai.annualValue / 1000, 30);
      if (yutai.approxInvestment <= 100000) score += 10;
      else if (yutai.approxInvestment <= 300000) score += 7;
      else if (yutai.approxInvestment <= 500000) score += 5;
      else if (yutai.approxInvestment <= 1000000) score += 2;

      matched.push({
        yutai,
        score,
        matchedExpenseCategories: [expense],
        matchedBrands: [],
        annualSavings: yutai.annualValue,
        matchReason: generateExpenseMatchReason([expense], [], yutai),
      });
    }

    matched.sort((a, b) => b.score - a.score);
    result.set(expense, matched);
  }

  return result;
}

export type CalendarMonthEntry = {
  month: number;
  yutai: Yutai;
  annualValue: number; // この権利確定月に帰属する優待価値(annualValue / rightsMonths.length)
};

export type CalendarPackage = {
  totalAnnualValue: number;
  totalInvestment: number;
  monthEntries: CalendarMonthEntry[];
  uncoveredMonths: number[];
  selectedYutai: Yutai[];
};

// 出費カテゴリにマッチする銘柄から、権利確定月が年間に分散するポートフォリオを生成
export function buildCalendarPackage(
  lifestyle: UserExpenseLifestyle,
  yutaiList: Yutai[]
): CalendarPackage {
  // Step 1: 選択カテゴリにマッチする候補銘柄を収集(重複除外)
  const candidates: { yutai: Yutai; categoryMatch: boolean }[] = [];
  const seenIds = new Set<string>();

  for (const expense of lifestyle.expenseCategories) {
    const mapping = expenseToYutaiMatch[expense as ExpenseCategory];
    if (!mapping) continue;

    for (const yutai of yutaiList) {
      if (seenIds.has(yutai.id)) continue;
      if (yutai.annualValue <= 0) continue;
      if (!yutai.rightsMonths || yutai.rightsMonths.length === 0) continue;
      if (lifestyle.maxInvestment && yutai.approxInvestment > lifestyle.maxInvestment) continue;

      const catMatch = yutai.categories.some((c) => mapping.categories.includes(c));
      const tagMatch = yutai.lifestyleTags.some((t) => mapping.tags.includes(t));
      if (!catMatch && !tagMatch) continue;

      candidates.push({ yutai, categoryMatch: catMatch });
      seenIds.add(yutai.id);
    }
  }

  // Step 2: スコアリング(年間優待価値・利回り重視)
  const scored = candidates
    .map(({ yutai, categoryMatch }) => {
      let score = 0;
      if (categoryMatch) score += 30;
      score += Math.min(yutai.annualValue / 1000, 50);
      score += (yutai.yieldPercent ?? 0) * 2;
      return { yutai, score };
    })
    .sort((a, b) => b.score - a.score);

  // Step 3: 月別に割り当て(月あたり最大2銘柄、合計最大15銘柄)
  const MAX_PER_MONTH = 2;
  const MAX_TOTAL = 15;
  const monthCount: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) monthCount[m] = 0;

  const monthEntries: CalendarMonthEntry[] = [];
  const selectedYutaiMap = new Map<string, Yutai>();
  let totalSelected = 0;

  for (const { yutai } of scored) {
    if (totalSelected >= MAX_TOTAL) break;

    const usableMonths = yutai.rightsMonths.filter((m) => monthCount[m] < MAX_PER_MONTH);
    if (usableMonths.length === 0) continue;

    const valuePerMonth = yutai.annualValue / yutai.rightsMonths.length;
    for (const m of usableMonths) {
      monthEntries.push({ month: m, yutai, annualValue: valuePerMonth });
      monthCount[m]++;
    }
    selectedYutaiMap.set(yutai.id, yutai);
    totalSelected++;
  }

  // Step 4: 集計
  const selectedYutai = Array.from(selectedYutaiMap.values());
  const totalInvestment = selectedYutai.reduce((sum, y) => sum + y.approxInvestment, 0);
  const totalAnnualValue = selectedYutai.reduce((sum, y) => sum + y.annualValue, 0);
  const uncoveredMonths: number[] = [];
  for (let m = 1; m <= 12; m++) {
    if (monthCount[m] === 0) uncoveredMonths.push(m);
  }

  monthEntries.sort((a, b) => a.month - b.month);

  return { totalAnnualValue, totalInvestment, monthEntries, uncoveredMonths, selectedYutai };
}

// ── 予算別おすすめパッケージ ────────────────────────────────────────

/** ライフスタイルにマッチする候補銘柄を返す(予算フィルタなし・重複排除済み) */
export function filterCandidatesForBudget(
  lifestyle: UserExpenseLifestyle,
  yutaiList: Yutai[]
): Yutai[] {
  const seenIds = new Set<string>();
  const candidates: Yutai[] = [];

  for (const expense of lifestyle.expenseCategories) {
    const mapping = expenseToYutaiMatch[expense as ExpenseCategory];
    if (!mapping) continue;

    for (const yutai of yutaiList) {
      if (seenIds.has(yutai.id)) continue;
      if (yutai.annualValue <= 0) continue;

      const catMatch = yutai.categories.some((c) => mapping.categories.includes(c));
      const tagMatch = yutai.lifestyleTags.some((t) => mapping.tags.includes(t));
      if (!catMatch && !tagMatch) continue;

      candidates.push(yutai);
      seenIds.add(yutai.id);
    }
  }

  return candidates;
}

export type BudgetPackage = {
  budget: number;
  totalInvestment: number;
  totalAnnualValue: number;
  selectedYutai: { yutai: Yutai; annualSavings: number }[];
  unusedBudget: number;
};

/** 予算内でコスパ最大となる銘柄の組み合わせをGreedy法で返す(最大10銘柄) */
export function buildBudgetPackage(
  _lifestyle: UserExpenseLifestyle,
  candidates: Yutai[],
  budget: number
): BudgetPackage {
  const MAX_STOCKS = 10;

  // コスパ(年間優待価値 / 投資額)でソート
  const sorted = candidates
    .filter((y) => y.approxInvestment <= budget && y.approxInvestment > 0)
    .sort((a, b) => b.annualValue / b.approxInvestment - a.annualValue / a.approxInvestment);

  let totalInvestment = 0;
  const selected: { yutai: Yutai; annualSavings: number }[] = [];

  for (const yutai of sorted) {
    if (selected.length >= MAX_STOCKS) break;
    if (totalInvestment + yutai.approxInvestment > budget) continue;
    totalInvestment += yutai.approxInvestment;
    selected.push({ yutai, annualSavings: yutai.annualValue });
  }

  const totalAnnualValue = selected.reduce((sum, s) => sum + s.annualSavings, 0);

  return {
    budget,
    totalInvestment,
    totalAnnualValue,
    selectedYutai: selected,
    unusedBudget: budget - totalInvestment,
  };
}

// ── 銘柄個別ページ用ユーティリティ ───────────────────────────────

/** 銘柄から該当する出費カテゴリを逆引きする */
export function getMatchingExpenseCategoriesForYutai(yutai: Yutai): ExpenseCategory[] {
  const matched: ExpenseCategory[] = [];
  for (const expense of EXPENSE_CATEGORIES) {
    const mapping = expenseToYutaiMatch[expense];
    if (!mapping) continue;
    const catMatch = yutai.categories.some((c) => mapping.categories.includes(c));
    const tagMatch = yutai.lifestyleTags.some((t) => mapping.tags.includes(t));
    if (catMatch || tagMatch) {
      matched.push(expense);
    }
  }
  return matched;
}

/** 同じカテゴリを持つ関連銘柄を取得(自分自身を除く、上位N件) */
export function getRelatedYutai(
  currentYutai: Yutai,
  yutaiList: Yutai[],
  limit: number = 5
): Yutai[] {
  return yutaiList
    .filter((y) => y.id !== currentYutai.id && y.annualValue > 0)
    .filter((y) => y.categories.some((c) => currentYutai.categories.includes(c)))
    .sort((a, b) => b.annualValue - a.annualValue)
    .slice(0, limit);
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
