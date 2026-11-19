import { describe, expect, it } from "vitest";
import { makeYutai } from "./fixtures";
import {
  buildReceiptFlow,
  buildShareTiers,
  buildStockFaq,
  buildUsageForms,
  explicitRecordDays,
  getCategoryAlternatives,
} from "@/lib/stock-guide";
import { buildCategoryFaq, buildModelCase, buildSelectionPoints } from "@/lib/category-guide";
import { YUTAI_LIST, hasActiveYutai, isAbolishedYutai } from "@/lib/yutai-data";
import { EXPENSE_CATEGORIES } from "@/lib/matching";

describe("buildShareTiers", () => {
  it("説明文の株数区分を原文のまま行にし、必要投資額は同じ株価で換算する", () => {
    const y = makeYutai({
      code: "T1",
      minShares: 100,
      approxInvestment: 97100,
      annualValue: 5000,
      description: "100株以上でデジタルギフト2,500円相当を年2回。500株以上13,500円、1,000株以上30,000円相当。",
    });
    const rows = buildShareTiers(y);
    expect(rows.map((r) => r.shares)).toEqual([100, 500, 1000]);
    expect(rows[0].content).toBe("100株以上でデジタルギフト2,500円相当を年2回。");
    expect(rows[0].annualValueText).toBe("5,000円");
    // 971円/株 × 500株
    expect(rows[1].investment).toBe(485500);
    expect(rows[1].content).toBe("500株以上13,500円");
    expect(rows[2].content).toBe("1,000株以上30,000円相当");
    expect(rows[2].annualValueText).toBe("当サイト未換算");
  });

  it("括弧内の「。」で文を切らない", () => {
    const y = makeYutai({
      code: "T2",
      description: "100株以上を1年以上継続保有(名簿に連続3回以上。経過措置あり)で乗車券4枚。300株以上で追加。",
    });
    const rows = buildShareTiers(y);
    expect(rows[0].content).toBe("100株以上を1年以上継続保有(名簿に連続3回以上。経過措置あり)で乗車券4枚。");
    expect(rows[1].content).toBe("300株以上で追加");
  });

  it("区分の記載がなければ最低株数の1行だけ", () => {
    expect(buildShareTiers(makeYutai({ code: "T3", description: "2,000円相当の自社商品" }))).toHaveLength(1);
  });
});

describe("buildReceiptFlow", () => {
  const today = new Date(2026, 10, 18); // 2026-11-18(水)

  it("継続保有条件なし: 次の基準日と権利付最終日(2営業日前)を出す", () => {
    const steps = buildReceiptFlow(makeYutai({ code: "F1", rightsMonths: [3, 9] }), today);
    expect(steps).toHaveLength(3);
    // 2027-03-31(水) の2営業日前 = 3/29(月)
    expect(steps[0].body).toContain("2027年3月末");
    expect(steps[0].body).toContain("2027年3月29日(月)");
    expect(steps[2].body).toContain("2027年6月頃");
  });

  it("継続保有条件あり: 名簿記録の日程を回数分並べる", () => {
    const y = makeYutai({
      code: "F2",
      rightsMonths: [9],
      recordMonths: [3, 9],
      requiredConsecutiveRecords: 3,
      holdingRequirement: "1年以上",
    });
    const steps = buildReceiptFlow(y, today);
    expect(steps[1].body).toContain("1回目 2027年3月末");
    expect(steps[1].body).toContain("3回目 2028年3月末");
    // 3回目(2028年3月)以降で最初の優待基準日は2028年9月
    expect(steps[2].body).toContain("2028年9月末");
  });

  it("説明文に月末以外の基準日があれば、その日から権利付最終日を求める", () => {
    const y = makeYutai({ code: "F3", rightsMonths: [3], description: "自社製品5,000円相当(3月20日権利・年1回)。" });
    expect(explicitRecordDays(y).get(3)).toBe(20);
    const steps = buildReceiptFlow(y, today);
    // 2027-03-20 は土曜 → 3/19(金) から2営業日前 = 3/17(水)
    expect(steps[0].body).toContain("2027年3月20日");
    expect(steps[0].body).toContain("2027年3月17日(水)");
  });

  it("判定方法が未入力の継続保有条件では日付を出さない", () => {
    const steps = buildReceiptFlow(makeYutai({ code: "F4", holdingRequirement: "1年以上" }), today);
    expect(steps[0].body).toContain("算出していません");
    expect(steps.some((s) => /\d{4}年\d+月\d+日/.test(s.body))).toBe(false);
  });
});

describe("buildUsageForms", () => {
  it("同じ箇所から読み取れる形式は1件にまとめ、原文を引用する", () => {
    const forms = buildUsageForms(
      makeYutai({ code: "U1", description: "100株以上でポイント2,000円相当(または同額の寄付)を年2回(3月・9月)。" }),
    );
    expect(forms).toHaveLength(1);
    expect(forms[0].form).toBe("ポイント・寄付の選択");
    expect(forms[0].quote).toContain("(3月・9月)");
  });

  it("自社商品券は商品券として扱い、現物とはしない", () => {
    const forms = buildUsageForms(makeYutai({ code: "U2", description: "1,000円相当の自社商品券" }));
    expect(forms.map((f) => f.form)).toEqual(["商品券・ギフトカード"]);
  });
});

describe("buildModelCase", () => {
  it("権利確定月が重ならない銘柄を必要投資額の安い順に選ぶ", () => {
    const list = [
      makeYutai({ code: "M1", categories: ["外食"], approxInvestment: 50000, rightsMonths: [3, 9] }),
      makeYutai({ code: "M2", categories: ["外食"], approxInvestment: 60000, rightsMonths: [3] }),
      makeYutai({ code: "M3", categories: ["外食"], approxInvestment: 70000, rightsMonths: [6] }),
      makeYutai({ code: "M4", categories: ["外食"], approxInvestment: 80000, rightsMonths: [12] }),
    ];
    const mc = buildModelCase("外食・カフェ", list)!;
    expect(mc.stocks.map((y) => y.code)).toEqual(["M1", "M3", "M4"]);
    expect(mc.totalInvestment).toBe(200000);
    expect(mc.months).toEqual([3, 6, 9, 12]);
  });
});

describe("掲載データ全件での生成文", () => {
  // CLAUDE.md「法的境界」: 投資助言と取られる文言を生成文に含めない
  const FORBIDDEN = /買うべき|売るべき|目標株価|絶対|確実|おすすめ|オススメ|推奨します|お得です/;
  const pages = YUTAI_LIST.filter((y) => hasActiveYutai(y) || isAbolishedYutai(y));
  const today = new Date(2026, 10, 18);

  it("銘柄ページの生成文に禁止表現を含まない", () => {
    for (const y of pages) {
      const texts = [
        ...buildShareTiers(y).map((r) => r.content),
        ...buildReceiptFlow(y, today).map((s) => s.body),
        ...buildUsageForms(y).map((u) => u.note),
        ...getCategoryAlternatives(y, YUTAI_LIST).map((a) => a.line),
        ...buildStockFaq(y, YUTAI_LIST, today).flatMap((f) => [f.q, f.a]),
      ];
      for (const t of texts) {
        // 説明文の原文引用(優待内容)は企業の表記なので対象外にし、当サイトの生成文だけを見る
        if (y.description.includes(t)) continue;
        expect(t, `${y.code}: ${t}`).not.toMatch(FORBIDDEN);
      }
    }
  });

  it("実施中の銘柄はFAQが4問、廃止銘柄は2〜3問", () => {
    for (const y of pages) {
      const n = buildStockFaq(y, YUTAI_LIST, today).length;
      if (hasActiveYutai(y)) expect(n).toBe(4);
      else expect(n).toBeGreaterThanOrEqual(2);
    }
  });

  it("カテゴリの生成文に禁止表現を含まず、組み合わせ例は全カテゴリで作れる", () => {
    for (const e of EXPENSE_CATEGORIES) {
      const texts = [
        ...buildSelectionPoints(e, YUTAI_LIST).map((p) => p.body),
        ...buildCategoryFaq(e, YUTAI_LIST).flatMap((f) => [f.q, f.a]),
      ];
      for (const t of texts) expect(t, `${e}: ${t}`).not.toMatch(FORBIDDEN);
      const mc = buildModelCase(e, YUTAI_LIST);
      expect(mc, e).not.toBeNull();
      const months = mc!.stocks.flatMap((y) => y.rightsMonths);
      expect(new Set(months).size, e).toBe(months.length);
    }
  });
});
