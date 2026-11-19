// matching.ts の現在の振る舞いを固定するテスト。
// 期待値はすべて実装のスコア式・選択手順から手計算したもの(各テストのコメント参照)。
// 仕様を変えるときは、テストを先に新しい期待値へ書き換えてから実装を変えること。
import { describe, expect, it } from "vitest";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_SLUGS,
  GIFT_CARD_FILTER_KEY,
  PREFERENCE_TAGS,
  buildBudgetAwareCalendarPackage,
  buildBudgetPackage,
  buildExpenseCategoryFacts,
  buildMultiYearCalendarPlan,
  calculatePreferenceMatchScore,
  countYutaiByCategory,
  countYutaiByTag,
  describeCalendarPosition,
  describePeakMonths,
  expenseToYutaiMatch,
  filterCandidatesForBudget,
  filterYutaiByStockListFilter,
  getAllBrands,
  getAllLifestyleTags,
  getBrandRelevanceScore,
  getExpenseCategoryBySlug,
  getFamilyShareType,
  getMatchingExpenseCategoriesForYutai,
  getRelatedYutai,
  getYutaiForExpenseCategory,
  groupBrandsByCategory,
  inferPreferenceTags,
  isGasolineYutai,
  isGiftCardYutai,
  matchYutai,
  matchYutaiByExpense,
  matchYutaiByExpenseGrouped,
  simulateFamilyShare,
  yutaiMatchesExpense,
  type ExpenseCategory,
} from "@/lib/matching";
import { makeYutai } from "./fixtures";

const codesOf = (list: Array<{ code: string }>) => list.map((y) => y.code);

// ── 定義データの整合性 ─────────────────────────────────────────

describe("出費カテゴリの定義", () => {
  it("EXPENSE_CATEGORIES・対応表・嗜好タグ・URLスラッグのキーが一致している", () => {
    const sorted = [...EXPENSE_CATEGORIES].sort();
    expect(Object.keys(expenseToYutaiMatch).sort()).toEqual(sorted);
    expect(Object.keys(PREFERENCE_TAGS).sort()).toEqual(sorted);
    expect(Object.keys(EXPENSE_CATEGORY_SLUGS).sort()).toEqual(sorted);
  });

  // スラッグは /expense/[slug] の公開URLになっている。変わるとURLが変わるため値ごと固定する
  it("URLスラッグが変わっていない", () => {
    expect(EXPENSE_CATEGORY_SLUGS).toEqual({
      "外食・カフェ": "eating-out",
      "自炊・食材": "groceries",
      "コンビニ・お菓子": "convenience",
      "日用品・ドラッグストア": "daily-goods",
      "衣服・ファッション": "fashion",
      "美容・スキンケア": "beauty",
      "通信費": "telecom",
      "車関連費(ガソリン・駐車場・整備)": "car",
      "交通・旅行": "travel",
      "エンタメ(映画・テーマパーク)": "entertainment",
      "健康・スポーツ": "health",
      "子育て・教育": "family",
      "趣味・ガジェット": "hobby",
      "ネットショッピング": "online-shopping",
    });
  });

  it("getExpenseCategoryBySlug はスラッグからカテゴリへ往復でき、未知のスラッグは undefined", () => {
    for (const expense of EXPENSE_CATEGORIES) {
      expect(getExpenseCategoryBySlug(EXPENSE_CATEGORY_SLUGS[expense])).toBe(expense);
    }
    expect(getExpenseCategoryBySlug("unknown")).toBeUndefined();
  });
});

// ── ブランド・タグ起点のマッチング ────────────────────────────

describe("matchYutai", () => {
  it("ブランド1件30点・タグ1件15点で採点し、スコア降順に並べ、理由文を組み立てる", () => {
    const rakuten = makeYutai({ code: "R", brands: ["楽天市場", "楽天モバイル"] });
    const both = makeYutai({ code: "B", brands: ["X"], lifestyleTags: ["国内旅行派"] });
    const tagOnly = makeYutai({ code: "T", lifestyleTags: ["国内旅行派"] });
    const none = makeYutai({ code: "N", brands: ["無関係"] });

    const results = matchYutai(
      { brands: ["楽天市場", "楽天モバイル", "X"], lifestyleTags: ["国内旅行派"] },
      [tagOnly, none, both, rakuten]
    );

    expect(results.map((r) => [r.yutai.code, r.score])).toEqual([
      ["R", 60],
      ["B", 45],
      ["T", 15],
    ]);
    expect(results[0].matchReason).toBe("あなたが使う『楽天市場』『楽天モバイル』の優待です");
    expect(results[1].matchReason).toBe(
      "あなたが使う『X』に加え、『国内旅行派』のライフスタイルにマッチ"
    );
    expect(results[2].matchReason).toBe("『国内旅行派』のあなたに合う優待です");
    expect(results[1].matchedBrands).toEqual(["X"]);
    expect(results[1].matchedTags).toEqual(["国内旅行派"]);
  });

  it("スコアは100点で頭打ち", () => {
    const y = makeYutai({ code: "A", brands: ["a", "b", "c", "d"] });
    expect(matchYutai({ brands: ["a", "b", "c", "d"], lifestyleTags: [] }, [y])[0].score).toBe(100);
  });

  it("maxInvestment を超える銘柄を除外する(同額は残す)", () => {
    const cheap = makeYutai({ code: "C", brands: ["x"], approxInvestment: 300000 });
    const expensive = makeYutai({ code: "E", brands: ["x"], approxInvestment: 300001 });
    const results = matchYutai({ brands: ["x"], lifestyleTags: [], maxInvestment: 300000 }, [
      cheap,
      expensive,
    ]);
    expect(codesOf(results.map((r) => r.yutai))).toEqual(["C"]);
  });

  // matchYutaiByExpense と異なり、maxInvestment: 0 は「0円以下だけ」という絞り込みとして効く
  it("maxInvestment: 0 は絞り込みとして扱われる", () => {
    const y = makeYutai({ code: "A", brands: ["x"], approxInvestment: 1 });
    expect(matchYutai({ brands: ["x"], lifestyleTags: [], maxInvestment: 0 }, [y])).toEqual([]);
  });
});

describe("ブランド・タグの一覧と集計", () => {
  const list = [
    makeYutai({ code: "1", brands: ["b", "a"], lifestyleTags: ["t2"], categories: ["外食", "カフェ"] }),
    makeYutai({ code: "2", brands: ["a", "c"], lifestyleTags: ["t1", "t2"], categories: ["外食"] }),
    makeYutai({ code: "3", brands: ["d"], categories: ["家電", "外食"] }),
  ];

  it("getAllBrands / getAllLifestyleTags は重複を除いてソートする", () => {
    expect(getAllBrands(list)).toEqual(["a", "b", "c", "d"]);
    expect(getAllLifestyleTags(list)).toEqual(["t1", "t2"]);
  });

  it("groupBrandsByCategory は先頭カテゴリだけでブランドをまとめる", () => {
    expect(groupBrandsByCategory(list)).toEqual({ 外食: ["a", "b", "c"], 家電: ["d"] });
  });

  it("getBrandRelevanceScore は興味に対応するカテゴリ1件10点・タグ1件5点を合算する", () => {
    const yutaiList = [
      makeYutai({ code: "1", brands: ["B"], categories: ["外食", "カフェ"], lifestyleTags: ["朝活"] }),
      makeYutai({ code: "2", brands: ["B"], categories: ["家電"] }),
      makeYutai({ code: "3", brands: ["他"], categories: ["外食"] }),
    ];
    // 食事・グルメ → 外食・カフェ・食品・飲料。銘柄1: 2カテゴリ×10 + 1タグ×5 = 25、銘柄2: 0
    expect(getBrandRelevanceScore("B", ["食事・グルメ", "未知の興味"], ["朝活"], yutaiList)).toBe(25);
  });
});

// ── 出費カテゴリ起点のマッチング ──────────────────────────────

describe("matchYutaiByExpense", () => {
  const lifestyle = { expenseCategories: ["外食・カフェ"] as ExpenseCategory[], brands: ["ブランドA"] };

  it("年間価値・投資額・カテゴリ一致・タグ一致・ブランド一致を加点して降順に並べる", () => {
    // min(10000/500, 60)=20 + 10万以下20 + カテゴリ20 + タグ10 + ブランド10 = 80
    const full = makeYutai({
      code: "F",
      categories: ["外食"],
      lifestyleTags: ["朝活"],
      brands: ["ブランドA"],
      annualValue: 10000,
      approxInvestment: 80000,
    });
    // min(40000/500, 60)=60 + 100万超0 + ブランド10 = 70(出費カテゴリには一致しない)
    const brandOnly = makeYutai({
      code: "B",
      categories: ["家電"],
      brands: ["ブランドA"],
      annualValue: 40000,
      approxInvestment: 1500000,
    });
    // 3000/500=6 + 30万以下15 + カテゴリ20 = 41
    const catOnly = makeYutai({
      code: "C",
      categories: ["カフェ"],
      annualValue: 3000,
      approxInvestment: 250000,
    });
    const noValue = makeYutai({ code: "Z", categories: ["外食"], annualValue: 0 });
    const unrelated = makeYutai({ code: "U", categories: ["家電"] });

    const results = matchYutaiByExpense(lifestyle, [catOnly, unrelated, noValue, brandOnly, full]);

    expect(results.map((r) => [r.yutai.code, r.score])).toEqual([
      ["F", 80],
      ["B", 70],
      ["C", 41],
    ]);
    expect(results[0].matchReason).toBe("あなたの「外食・カフェ」を削減。あなたが使う『ブランドA』に対応");
    expect(results[1].matchReason).toBe("あなたが使う『ブランドA』に対応");
    expect(results[1].matchedExpenseCategories).toEqual([]);
    expect(results[2].matchReason).toBe("あなたの「外食・カフェ」を削減");
    expect(results[0].annualSavings).toBe(10000);
  });

  it.each([
    [100000, 20],
    [100001, 15],
    [300000, 15],
    [500000, 10],
    [1000000, 5],
    [1000001, 0],
  ])("投資額 %i 円の加点は %i 点", (approxInvestment, bonus) => {
    // 年間価値 500円 → 1点、カテゴリ一致 20点
    const y = makeYutai({ code: "A", categories: ["外食"], annualValue: 500, approxInvestment });
    expect(matchYutaiByExpense({ expenseCategories: ["外食・カフェ"], brands: [] }, [y])[0].score).toBe(
      1 + bonus + 20
    );
  });

  it("maxInvestment を超える銘柄を除外し、0 や未指定は絞り込みなしとして扱う", () => {
    const y = makeYutai({ code: "A", categories: ["外食"], approxInvestment: 200000 });
    const base = { expenseCategories: ["外食・カフェ"] as ExpenseCategory[], brands: [] };
    expect(matchYutaiByExpense({ ...base, maxInvestment: 199999 }, [y])).toEqual([]);
    expect(matchYutaiByExpense({ ...base, maxInvestment: 200000 }, [y])).toHaveLength(1);
    expect(matchYutaiByExpense({ ...base, maxInvestment: 0 }, [y])).toHaveLength(1);
    expect(matchYutaiByExpense(base, [y])).toHaveLength(1);
  });

  it("対応表にない出費カテゴリ(旧URLパラメータ)は無視する", () => {
    const y = makeYutai({ code: "A", categories: ["外食"] });
    const results = matchYutaiByExpense(
      { expenseCategories: ["存在しないカテゴリ" as ExpenseCategory, "外食・カフェ"], brands: [] },
      [y]
    );
    expect(results[0].matchedExpenseCategories).toEqual(["外食・カフェ"]);
  });
});

describe("matchYutaiByExpenseGrouped", () => {
  it("出費カテゴリごとに独立して採点・ソートする", () => {
    // カテゴリ40 + タグ20 + min(50000/1000, 30)=30 + 10万以下10 = 100
    const best = makeYutai({
      code: "B",
      categories: ["外食"],
      lifestyleTags: ["朝活"],
      annualValue: 50000,
      approxInvestment: 100000,
    });
    // タグ20 + 2000/1000=2 + 50万以下5 = 27
    const tagOnly = makeYutai({
      code: "T",
      categories: ["家電"],
      lifestyleTags: ["朝活"],
      annualValue: 2000,
      approxInvestment: 400000,
    });
    // カテゴリ40 + 1 + 100万以下2 = 43
    const travel = makeYutai({
      code: "J",
      categories: ["航空"],
      annualValue: 1000,
      approxInvestment: 900000,
    });

    const grouped = matchYutaiByExpenseGrouped(
      {
        expenseCategories: ["外食・カフェ", "交通・旅行", "旧カテゴリ" as ExpenseCategory],
        brands: [],
      },
      [tagOnly, travel, best]
    );

    expect([...grouped.keys()]).toEqual(["外食・カフェ", "交通・旅行"]);
    expect(grouped.get("外食・カフェ")!.map((r) => [r.yutai.code, r.score])).toEqual([
      ["B", 100],
      ["T", 27],
    ]);
    expect(grouped.get("交通・旅行")!.map((r) => [r.yutai.code, r.score])).toEqual([["J", 43]]);
    expect(grouped.get("交通・旅行")![0].matchReason).toBe("あなたの「交通・旅行」を削減");
  });

  it("年間価値0の銘柄と maxInvestment 超の銘柄を除外する", () => {
    const list = [
      makeYutai({ code: "Z", categories: ["外食"], annualValue: 0 }),
      makeYutai({ code: "E", categories: ["外食"], approxInvestment: 500001 }),
      makeYutai({ code: "OK", categories: ["外食"], approxInvestment: 500000 }),
    ];
    const grouped = matchYutaiByExpenseGrouped(
      { expenseCategories: ["外食・カフェ"], brands: [], maxInvestment: 500000 },
      list
    );
    expect(grouped.get("外食・カフェ")!.map((r) => r.yutai.code)).toEqual(["OK"]);
  });
});

// ── 予算付きカレンダー ────────────────────────────────────────

describe("buildBudgetAwareCalendarPackage", () => {
  // 予算100万円 → Pass 1 の単銘柄上限は15万円、ゴースト候補は100万超〜150万以下
  const A = makeYutai({ code: "A", approxInvestment: 100000, annualValue: 5000, rightsMonths: [3] });
  const B = makeYutai({ code: "B", approxInvestment: 140000, annualValue: 3000, rightsMonths: [3, 9] });
  const C = makeYutai({ code: "C", approxInvestment: 600000, annualValue: 40000, rightsMonths: [6] });
  const D = makeYutai({ code: "D", approxInvestment: 1200000, annualValue: 30000, rightsMonths: [12] });
  const E = makeYutai({ code: "E", approxInvestment: 2000000, annualValue: 90000, rightsMonths: [1] });
  const F = makeYutai({ code: "F", approxInvestment: 10000, annualValue: 0, rightsMonths: [2] });
  const candidates = [A, B, C, D, E, F];

  it("Pass 1 で安価に月を埋め、Pass 2 でスコア順に予算を使い、未カバー月にゴーストを置く", () => {
    // Pass 1: 3月(最安10万=A) → 9月(B。3月にも重ねて配置) / Pass 2: C(スコア40)
    // ゴースト: D(12月)。E は予算+50万を超えるので対象外、F は年間価値0で対象外
    const pkg = buildBudgetAwareCalendarPackage(candidates, 1000000, []);

    expect(pkg.confirmed.map((e) => [e.month, e.yutai.code])).toEqual([
      [3, "A"],
      [3, "B"],
      [6, "C"],
      [9, "B"],
    ]);
    expect(pkg.ghost.map((e) => [e.month, e.yutai.code])).toEqual([[12, "D"]]);
    expect(pkg.confirmedTotalInvestment).toBe(840000);
    expect(pkg.confirmedAnnualValue).toBe(48000);
    expect(pkg.confirmedYield).toBeCloseTo((48000 / 840000) * 100, 10);
    expect(pkg.confirmedMonthCount).toBe(3);
    expect(pkg.confirmedYutaiCount).toBe(3);
    expect(pkg.ghostTotalInvestment).toBe(1200000);
    expect(pkg.ghostAnnualValue).toBe(30000);
  });

  it("保有銘柄(heldCodes)は確定・ゴーストのどちらにも出さない", () => {
    const pkg = buildBudgetAwareCalendarPackage(candidates, 1000000, [], ["C", "D"]);
    const codes = [...pkg.confirmed, ...pkg.ghost].map((e) => e.yutai.code);
    expect(codes).not.toContain("C");
    expect(codes).not.toContain("D");
  });

  it("確定銘柄の投資額合計は予算を超えない", () => {
    for (const budget of [0, 50000, 100000, 240000, 500000, 839999, 1000000, 3000000]) {
      const pkg = buildBudgetAwareCalendarPackage(candidates, budget, []);
      expect(pkg.confirmedTotalInvestment).toBeLessThanOrEqual(budget);
    }
  });

  it("Pass 1 は予算の15%を超える銘柄を使わず、高額銘柄の選択は Pass 2 に任せる", () => {
    // G(16万)は上限15万を超えるので Pass 1 で月埋めに使われない → Pass 2 でスコア順に H が先に入り、G は予算超過
    const G = makeYutai({ code: "G", approxInvestment: 160000, annualValue: 1000, rightsMonths: [4] });
    const H = makeYutai({ code: "H", approxInvestment: 900000, annualValue: 50000, rightsMonths: [8] });
    const pkg = buildBudgetAwareCalendarPackage([G, H], 1000000, []);
    expect(pkg.confirmed.map((e) => e.yutai.code)).toEqual(["H"]);
  });

  it("1ヶ月に置く確定銘柄は2件まで(同額なら年間価値の高い方から)", () => {
    const list = [1000, 2000, 3000].map((annualValue) =>
      makeYutai({ code: `M${annualValue}`, approxInvestment: 50000, annualValue, rightsMonths: [5] })
    );
    const pkg = buildBudgetAwareCalendarPackage(list, 1000000, []);
    expect(pkg.confirmed.map((e) => e.yutai.code)).toEqual(["M3000", "M2000"]);
  });

  it("嗜好タグの一致は1件10点の加点として選択順に影響する", () => {
    const P1 = makeYutai({ code: "P1", approxInvestment: 600000, annualValue: 20000, rightsMonths: [6] });
    const P2 = makeYutai({
      code: "P2",
      approxInvestment: 600000,
      annualValue: 15000,
      rightsMonths: [7],
      preferenceTags: ["cafe"],
    });
    // タグなし: P1(20点) > P2(15点)。cafe 指定: P2(25点) > P1(20点)。予算100万では1銘柄しか入らない
    expect(buildBudgetAwareCalendarPackage([P1, P2], 1000000, []).confirmed[0].yutai.code).toBe("P1");
    expect(buildBudgetAwareCalendarPackage([P1, P2], 1000000, ["cafe"]).confirmed[0].yutai.code).toBe(
      "P2"
    );
  });
});

describe("buildMultiYearCalendarPlan", () => {
  const X = makeYutai({ code: "X", approxInvestment: 25000, annualValue: 2000, rightsMonths: [1] });
  const Y = makeYutai({ code: "Y", approxInvestment: 90000, annualValue: 9000, rightsMonths: [6] });
  const Z = makeYutai({ code: "Z", approxInvestment: 150000, annualValue: 12000, rightsMonths: [12] });

  it("年間予算を均等割りし、使い残しを翌年へ繰り越しながら買い足す", () => {
    // 年10万円。1年目: X(2.5万)のみ → 7.5万繰越 / 2年目(17.5万): Z / 3年目(12.5万): Y
    const plan = buildMultiYearCalendarPlan([X, Y, Z], 300000, 3, []);

    expect(plan.recommendedAnnualBudget).toBe(100000);
    expect(
      plan.years.map((y) => ({
        year: y.year,
        codes: y.newEntries.map((e) => `${e.month}:${e.yutai.code}`),
        yearInvestment: y.yearInvestment,
        cumulativeInvestment: y.cumulativeInvestment,
        cumulativeAnnualValue: y.cumulativeAnnualValue,
        cumulativeCoveredMonths: y.cumulativeCoveredMonths,
      }))
    ).toEqual([
      { year: 1, codes: ["1:X"], yearInvestment: 25000, cumulativeInvestment: 25000, cumulativeAnnualValue: 2000, cumulativeCoveredMonths: 1 },
      { year: 2, codes: ["12:Z"], yearInvestment: 150000, cumulativeInvestment: 175000, cumulativeAnnualValue: 14000, cumulativeCoveredMonths: 2 },
      { year: 3, codes: ["6:Y"], yearInvestment: 90000, cumulativeInvestment: 265000, cumulativeAnnualValue: 23000, cumulativeCoveredMonths: 3 },
    ]);
    expect(plan.finalCoveredMonths).toBe(3);
    expect(plan.finalAnnualValue).toBe(23000);
    expect(plan.finalInvestment).toBe(265000);
  });

  it("保有銘柄は候補から除き、その年間価値と権利月を初年度から計上する", () => {
    // X を保有済み → 1年目は Y(9万)、2年目(11万)は Z が入らず繰越、3年目(21万)で Z
    const plan = buildMultiYearCalendarPlan([X, Y, Z], 300000, 3, [], [X]);

    expect(plan.years[0].newEntries.map((e) => e.yutai.code)).toEqual(["Y"]);
    expect(plan.years[0].cumulativeAnnualValue).toBe(11000);
    expect(plan.years[0].cumulativeCoveredMonths).toBe(2);
    expect(plan.years[1].newEntries).toEqual([]);
    expect(plan.years[2].newEntries.map((e) => e.yutai.code)).toEqual(["Z"]);
    expect(plan.finalInvestment).toBe(240000);
    expect(plan.finalAnnualValue).toBe(23000);
  });

  it("年間推奨予算は1万円単位に丸め、最低1万円", () => {
    expect(buildMultiYearCalendarPlan([], 10000, 5, []).recommendedAnnualBudget).toBe(10000);
    expect(buildMultiYearCalendarPlan([], 1234567, 10, []).recommendedAnnualBudget).toBe(120000);
  });
});

// ── 予算別パッケージ ──────────────────────────────────────────

describe("filterCandidatesForBudget", () => {
  it("出費カテゴリの順に候補を集め、重複と年間価値0を除く", () => {
    const T1 = makeYutai({ code: "T1", categories: ["航空"] });
    const F1 = makeYutai({ code: "F1", categories: ["外食"] });
    const F2 = makeYutai({ code: "F2", categories: ["外食"], annualValue: 0 });
    const both = makeYutai({ code: "B", categories: ["外食", "旅行"] });

    const result = filterCandidatesForBudget(
      { expenseCategories: ["外食・カフェ", "旧カテゴリ" as ExpenseCategory, "交通・旅行"], brands: [] },
      [T1, F1, F2, both]
    );
    expect(codesOf(result)).toEqual(["F1", "B", "T1"]);
  });
});

describe("buildBudgetPackage", () => {
  const lifestyle = { expenseCategories: [] as ExpenseCategory[], brands: [] };

  it("年間価値/投資額の高い順に、予算内に収まるものを選ぶ", () => {
    const list = [
      makeYutai({ code: "a", approxInvestment: 100000, annualValue: 5000 }), // 0.05
      makeYutai({ code: "b", approxInvestment: 50000, annualValue: 4000 }), // 0.08
      makeYutai({ code: "c", approxInvestment: 200000, annualValue: 6000 }), // 0.03
      makeYutai({ code: "d", approxInvestment: 0, annualValue: 6000 }), // 投資額0は対象外
      makeYutai({ code: "e", approxInvestment: 400000, annualValue: 30000 }), // 予算超
    ];
    const pkg = buildBudgetPackage(lifestyle, list, 300000);
    // b(5万) → a(累計15万) → c は 35万になるので入らない
    expect(pkg.selectedYutai.map((s) => s.yutai.code)).toEqual(["b", "a"]);
    expect(pkg.totalInvestment).toBe(150000);
    expect(pkg.totalAnnualValue).toBe(9000);
    expect(pkg.unusedBudget).toBe(150000);
    expect(pkg.budget).toBe(300000);
  });

  it("最大10銘柄まで", () => {
    const list = Array.from({ length: 12 }, (_, i) =>
      makeYutai({ code: `s${i}`, approxInvestment: 10000, annualValue: 1000 })
    );
    expect(buildBudgetPackage(lifestyle, list, 1000000).selectedYutai).toHaveLength(10);
  });
});

// ── カテゴリページ・銘柄ページ用 ────────────────────────────────

describe("出費カテゴリ別の銘柄取得", () => {
  it("getYutaiForExpenseCategory は実施中の銘柄だけを年間価値の降順で返し、単発優待も含める", () => {
    const list = [
      makeYutai({ code: "low", categories: ["通信"], annualValue: 1000 }),
      makeYutai({ code: "high", categories: ["通信"], annualValue: 5000 }),
      makeYutai({
        code: "once",
        categories: ["通信"],
        annualValue: 0,
        oneTimeBenefits: [{ afterYears: 2, value: 1500 }],
      }),
      makeYutai({ code: "gone", categories: ["通信"], status: "abolished" }),
      makeYutai({ code: "none", categories: ["通信"], annualValue: 0 }),
      makeYutai({ code: "other", categories: ["外食"] }),
    ];
    expect(codesOf(getYutaiForExpenseCategory("通信費", list))).toEqual(["high", "low", "once"]);
    expect(codesOf(getYutaiForExpenseCategory("通信費", list, 1))).toEqual(["high"]);
  });

  it("yutaiMatchesExpense はカテゴリかライフスタイルタグのどちらかが合えば true", () => {
    expect(yutaiMatchesExpense(makeYutai({ code: "1", categories: ["通信"] }), "通信費")).toBe(true);
    expect(yutaiMatchesExpense(makeYutai({ code: "2", lifestyleTags: ["auユーザー"] }), "通信費")).toBe(true);
    expect(yutaiMatchesExpense(makeYutai({ code: "3", categories: ["外食"] }), "通信費")).toBe(false);
  });

  it("getMatchingExpenseCategoriesForYutai は EXPENSE_CATEGORIES の順で該当カテゴリを返す", () => {
    // 外食 は「外食・カフェ」と「子育て・教育」の両方の対応カテゴリに含まれる
    expect(getMatchingExpenseCategoriesForYutai(makeYutai({ code: "1", categories: ["外食"] }))).toEqual([
      "外食・カフェ",
      "子育て・教育",
    ]);
    expect(
      getMatchingExpenseCategoriesForYutai(makeYutai({ code: "2", lifestyleTags: ["ウエル活"] }))
    ).toEqual(["日用品・ドラッグストア"]);
  });

  it("getRelatedYutai は自分自身と年間価値0を除き、カテゴリが重なる銘柄を価値順に返す", () => {
    const current = makeYutai({ code: "cur", categories: ["外食", "カフェ"] });
    const list = [
      current,
      makeYutai({ code: "r1", categories: ["カフェ"], annualValue: 1000 }),
      makeYutai({ code: "r2", categories: ["外食"], annualValue: 3000 }),
      makeYutai({ code: "r3", categories: ["外食"], annualValue: 0 }),
      makeYutai({ code: "r4", categories: ["家電"], annualValue: 9000 }),
    ];
    expect(codesOf(getRelatedYutai(current, list))).toEqual(["r2", "r1"]);
    expect(codesOf(getRelatedYutai(current, list, 1))).toEqual(["r2"]);
  });
});

describe("buildExpenseCategoryFacts / describePeakMonths / describeCalendarPosition", () => {
  const N1 = makeYutai({ code: "N1", categories: ["通信"], rightsMonths: [3, 9] });
  const N2 = makeYutai({ code: "N2", categories: ["通信"], rightsMonths: [3] });
  const N3 = makeYutai({ code: "N3", categories: ["通信"], rightsMonths: [6] });
  const R1 = makeYutai({ code: "R1", categories: ["外食"], rightsMonths: [12] });
  const R2 = makeYutai({ code: "R2", categories: ["外食"], rightsMonths: [12] });
  const T1 = makeYutai({ code: "T1", categories: ["航空"], rightsMonths: [12] });
  const list = [N1, N2, N3, R1, R2, T1];

  it("月ごとの権利確定銘柄数・ピーク月・空白月とその代替カテゴリを数える", () => {
    const facts = buildExpenseCategoryFacts("通信費", list);

    expect(facts.stockCount).toBe(3);
    expect(facts.monthCounts).toEqual([0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 0]);
    expect(facts.peak).toEqual({ months: [3], count: 2 });
    expect(facts.coverableMonthCount).toBe(3);
    expect(facts.emptyMonths.map((e) => e.month)).toEqual([1, 2, 4, 5, 7, 8, 10, 11, 12]);
    // 12月: 外食(R1,R2)は「外食・カフェ」「子育て・教育」の両方に数えられる。同数は定義順
    expect(facts.emptyMonths.find((e) => e.month === 12)!.alternatives).toEqual([
      { expense: "外食・カフェ", count: 2 },
      { expense: "子育て・教育", count: 2 },
      { expense: "交通・旅行", count: 1 },
    ]);
    expect(facts.emptyMonths.find((e) => e.month === 1)!.alternatives).toEqual([]);
    expect(describePeakMonths(facts)).toBe("3銘柄中2銘柄が3月確定");
  });

  it("該当銘柄がないカテゴリはピークなし", () => {
    const facts = buildExpenseCategoryFacts("ネットショッピング", list);
    expect(facts.peak).toBeNull();
    expect(describePeakMonths(facts)).toBeNull();
  });

  it("describeCalendarPosition は同じ権利月の銘柄数を文章にする", () => {
    expect(describeCalendarPosition(N3, list)).toBe(
      "通信費カテゴリで6月に権利確定するのはこの銘柄のみです。"
    );
    expect(describeCalendarPosition(N1, list)).toBe(
      "通信費カテゴリ3銘柄のうち、3月確定は本銘柄を含め2銘柄、9月確定は本銘柄を含め1銘柄です。"
    );
  });

  it("describeCalendarPosition は優待なし・権利月なし・該当カテゴリなしなら null", () => {
    expect(describeCalendarPosition(makeYutai({ code: "z", categories: ["通信"], annualValue: 0 }), list)).toBeNull();
    expect(describeCalendarPosition(makeYutai({ code: "m", categories: ["通信"], rightsMonths: [] }), list)).toBeNull();
    expect(describeCalendarPosition(makeYutai({ code: "o", categories: ["その他"] }), list)).toBeNull();
  });
});

// ── 判定・絞り込み ────────────────────────────────────────────

describe("銘柄の分類判定", () => {
  it("isGasolineYutai は給油所ブランドか説明文の「給油」で判定する", () => {
    expect(isGasolineYutai(makeYutai({ code: "1", brands: ["ENEOS"] }))).toBe(true);
    expect(isGasolineYutai(makeYutai({ code: "2", description: "給油時に使える割引券" }))).toBe(true);
    expect(isGasolineYutai(makeYutai({ code: "3", brands: ["オートバックス"], description: "カー用品割引" }))).toBe(false);
  });

  it("isGiftCardYutai はクオカード系の説明文で判定する", () => {
    expect(isGiftCardYutai(makeYutai({ code: "1", description: "クオカード1,000円分" }))).toBe(true);
    expect(isGiftCardYutai(makeYutai({ code: "2", description: "QUOカード500円分" }))).toBe(true);
    expect(isGiftCardYutai(makeYutai({ code: "3", description: "自社商品" }))).toBe(false);
  });

  it("countYutaiByCategory は年間価値0を除き、2件以上のカテゴリを件数順に返す", () => {
    const list = [
      makeYutai({ code: "1", categories: ["外食", "カフェ"] }),
      makeYutai({ code: "2", categories: ["外食"] }),
      makeYutai({ code: "3", categories: ["外食", "家電"] }),
      makeYutai({ code: "4", categories: ["カフェ"] }),
      makeYutai({ code: "5", categories: ["家電"], annualValue: 0 }),
    ];
    expect(countYutaiByCategory(list)).toEqual([
      { category: "外食", count: 3 },
      { category: "カフェ", count: 2 },
    ]);
  });

  it("filterYutaiByStockListFilter は null で全件、gift-card で金券系、それ以外はカテゴリで絞る", () => {
    const quo = makeYutai({ code: "q", description: "QUOカード" });
    const food = makeYutai({ code: "f", categories: ["外食"] });
    const list = [quo, food];
    expect(filterYutaiByStockListFilter(list, null)).toBe(list);
    expect(codesOf(filterYutaiByStockListFilter(list, GIFT_CARD_FILTER_KEY))).toEqual(["q"]);
    expect(codesOf(filterYutaiByStockListFilter(list, "外食"))).toEqual(["f"]);
  });

  it("家族分散: 個人消費型カテゴリは人数分、それ以外は1名義で計算する", () => {
    const telecom = makeYutai({ code: "t", categories: ["通信"], annualValue: 3000, approxInvestment: 200000 });
    const food = makeYutai({ code: "f", categories: ["外食"], annualValue: 3000, approxInvestment: 200000 });

    expect(getFamilyShareType(telecom)).toBe("individual");
    expect(simulateFamilyShare(telecom, 3)).toEqual({
      type: "individual",
      householdSize: 3,
      totalAnnualValue: 9000,
      totalInvestment: 600000,
      sharesNeeded: 3,
    });
    expect(getFamilyShareType(food)).toBe("shared");
    expect(simulateFamilyShare(food, 3)).toEqual({
      type: "shared",
      householdSize: 3,
      totalAnnualValue: 3000,
      totalInvestment: 200000,
      sharesNeeded: 1,
    });
  });
});

// ── 嗜好タグ ──────────────────────────────────────────────────

describe("嗜好タグ", () => {
  it("inferPreferenceTags は preferenceTags の指定があればそれを優先する", () => {
    const y = makeYutai({ code: "1", name: "スターバックス", preferenceTags: ["books"] });
    expect(inferPreferenceTags(y)).toEqual(["books"]);
  });

  it("inferPreferenceTags は銘柄名・説明・ブランド・カテゴリのキーワードから大文字小文字を区別せず推測する", () => {
    expect(inferPreferenceTags(makeYutai({ code: "1", name: "スターバックス" }))).toEqual(["cafe"]);
    expect(inferPreferenceTags(makeYutai({ code: "2", brands: ["ABEMA"] }))).toEqual(["streaming"]);
    expect(inferPreferenceTags(makeYutai({ code: "3" }))).toEqual([]);
  });

  it("鉄道系(train)の銘柄からは luxury-brand を外す", () => {
    const y = makeYutai({ code: "1", name: "京急", description: "百貨店で使える" });
    expect(inferPreferenceTags(y)).toEqual(["train"]);
  });

  it("calculatePreferenceMatchScore は一致タグ1件10点", () => {
    const cafe = makeYutai({ code: "1", preferenceTags: ["cafe"] });
    expect(calculatePreferenceMatchScore(cafe, [])).toEqual({ score: 0, matchedTags: [], hasMatch: false });
    expect(calculatePreferenceMatchScore(cafe, ["cafe", "noodles"])).toEqual({
      score: 10,
      matchedTags: ["cafe"],
      hasMatch: true,
    });
  });

  it("countYutaiByTag は年間価値0の銘柄を数えない", () => {
    const list = [
      makeYutai({ code: "1", preferenceTags: ["cafe"] }),
      makeYutai({ code: "2", preferenceTags: ["cafe"], annualValue: 0 }),
      makeYutai({ code: "3", preferenceTags: ["noodles"] }),
    ];
    expect(countYutaiByTag("cafe", list)).toBe(1);
  });
});
