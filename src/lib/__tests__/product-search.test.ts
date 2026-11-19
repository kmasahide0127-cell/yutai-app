// product-search.ts の現在の振る舞いを固定するテスト。
// ブランド辞書(brand-data.ts)は実データだと掲載ブランドの増減で結果が変わるため、
// このファイルでは架空の辞書に差し替えている。実データでの確認は product-search.data.test.ts。
import { describe, expect, it, vi } from "vitest";
import type { Brand, BrandRetailerLink, Retailer } from "@/lib/brand-data";
import {
  estimateFirstReceipt,
  formatOneTimeBenefits,
  formatYearMonth,
  getAbolishedNotice,
  getHoldingRequirementNotice,
  isAbolished,
  normalizeSearchText,
  searchProducts,
} from "@/lib/product-search";
import { makeYutai } from "./fixtures";

vi.mock("@/lib/brand-data", () => {
  const base = { aliases: [] as string[], dataQuality: "verified" as const, lastVerified: "2026-01-01" };
  const BRANDS: Brand[] = [
    // 辞書の並び順ではなく一致の強さ順に並ぶことを確かめるため、前方一致のブランドを先に置く
    { ...base, id: "alpha2", brandName: "アルファ2号", makerCompany: "アルファ2社", isListed: false },
    { ...base, id: "alpha", brandName: "アルファ", aliases: ["alpha", "アルファビューティ"], makerCompany: "アルファ社", ticker: "1111", isListed: true },
    { ...base, id: "beta", brandName: "ベータ", makerCompany: "ベータ社", ticker: "2222", isListed: true },
    { ...base, id: "gamma", brandName: "ガンマ", makerCompany: "ガンマ社", ticker: "3333", isListed: true },
    { ...base, id: "delta", brandName: "デルタ", makerCompany: "デルタ社", ticker: "4444", isListed: true },
    { ...base, id: "zeta", brandName: "ゼータ", makerCompany: "ゼータ社", isListed: true },
    { ...base, id: "epsilon", brandName: "イプシロン", aliases: ["epsilon"], makerCompany: "イプシロン社", isListed: false },
  ];
  const RETAILERS: Retailer[] = [
    { code: "5555", retailerName: "小売A", aliases: [], channels: [], dataQuality: "verified", lastVerified: "2026-01-01" },
    { code: "6666", retailerName: "小売B", aliases: [], channels: [], dataQuality: "verified", lastVerified: "2026-01-01" },
  ];
  const BRAND_RETAILER_LINKS: BrandRetailerLink[] = [
    { brandId: "epsilon", retailerCode: "5555", note: "一部店舗のみ" },
    { brandId: "epsilon", retailerCode: "6666" }, // 小売側の優待なし → 出さない
    { brandId: "epsilon", retailerCode: "9999" }, // 小売辞書に無い → 出さない
  ];
  return { BRANDS, RETAILERS, BRAND_RETAILER_LINKS };
});

// ── 表記ゆれの正規化 ──────────────────────────────────────────

describe("normalizeSearchText", () => {
  it.each([
    ["ﾘﾌｧ", "りふぁ"], // 半角カナ → 全角 → ひらがな
    ["ReFa", "refa"],
    ["ＲＥＦＡ", "refa"], // 全角英字
    ["リファー", "りふぁ"], // 長音符の除去
    ["シックス パッド", "しっくすぱっど"], // 空白の除去
    ["「AR・グラス」", "arぐらす"],
    ["  ", ""],
  ])("%s → %s", (input, expected) => {
    expect(normalizeSearchText(input)).toBe(expected);
  });
});

// ── 初回受取見込み ────────────────────────────────────────────

describe("estimateFirstReceipt", () => {
  // 2026年11月: 月末11/30(月) → 2営業日前の 11/26(木) が権利付最終日
  const nov = makeYutai({ code: "1", rightsMonths: [11] });

  it("権利付最終日までなら今月の基準日から数え、受取は基準日の3ヶ月後", () => {
    const est = estimateFirstReceipt(nov, new Date(2026, 10, 26))!;
    expect(est.recordDates).toEqual([{ year: 2026, month: 11 }]);
    expect(est.qualifyingRightsDate).toEqual({ year: 2026, month: 11 });
    expect(est.estimatedReceipt).toEqual({ year: 2027, month: 2 });
    expect(est.monthsAway).toBe(3);
    expect(est.missedCurrentCycle).toBe(false);
    expect(est.requiredRecords).toBe(1);
    expect(est.label).toBe("今から購入した場合、初回受取見込みは2027年2月頃");
  });

  it("権利付最終日を過ぎていれば翌サイクルからになる", () => {
    const est = estimateFirstReceipt(nov, new Date(2026, 10, 27))!;
    expect(est.missedCurrentCycle).toBe(true);
    expect(est.qualifyingRightsDate).toEqual({ year: 2027, month: 11 });
    expect(est.estimatedReceipt).toEqual({ year: 2028, month: 2 });
    expect(est.monthsAway).toBe(15);
  });

  // 現状の挙動の記録: 権利付最終日は 0:00 で比較しているため、当日でも時刻が 0:00 を
  // 過ぎていれば「間に合わない」扱いになる(画面からは new Date() = 現在時刻で呼ばれる)。
  // 意図した仕様かは未確認。変えるときはこのテストを更新する。
  it("権利付最終日の当日でも 0:00 を過ぎた時刻なら翌サイクル扱い(現状の挙動)", () => {
    expect(estimateFirstReceipt(nov, new Date(2026, 10, 26, 15, 0))!.missedCurrentCycle).toBe(true);
  });

  it("月末が土日の月は直前の金曜を月末営業日として2営業日さかのぼる", () => {
    // 2027年1月: 1/31(日) → 月末営業日 1/29(金) → 権利付最終日 1/27(水)
    const jan = makeYutai({ code: "1", rightsMonths: [1] });
    expect(estimateFirstReceipt(jan, new Date(2027, 0, 27))!.missedCurrentCycle).toBe(false);
    expect(estimateFirstReceipt(jan, new Date(2027, 0, 28))!.missedCurrentCycle).toBe(true);
  });

  it("継続保有の記録月と優待の基準日がずれる銘柄(MTG型)は、記録を積み上げた後の最初の基準日を使う", () => {
    // 3月・9月に連続3回記録 → 2026/3, 2026/9, 2027/3。その後最初の9月基準日 = 2027/9 → 受取 2027/12
    const mtg = makeYutai({
      code: "7806",
      rightsMonths: [9],
      recordMonths: [3, 9],
      requiredConsecutiveRecords: 3,
      holdingRequirement: "1年以上",
    });
    const est = estimateFirstReceipt(mtg, new Date(2026, 0, 10))!;
    expect(est.recordDates).toEqual([
      { year: 2026, month: 3 },
      { year: 2026, month: 9 },
      { year: 2027, month: 3 },
    ]);
    expect(est.qualifyingRightsDate).toEqual({ year: 2027, month: 9 });
    expect(est.estimatedReceipt).toEqual({ year: 2027, month: 12 });
    expect(est.monthsAway).toBe(23);
    expect(est.requiredRecords).toBe(3);
  });

  it("receiptLagMonths で受取までの月数を変えられ、年をまたいで数える", () => {
    const y = makeYutai({ code: "1", rightsMonths: [12], receiptLagMonths: 2 });
    const est = estimateFirstReceipt(y, new Date(2026, 0, 10))!;
    expect(est.estimatedReceipt).toEqual({ year: 2027, month: 2 });
    expect(est.monthsAway).toBe(13);
  });

  it("単発優待の銘柄は最初の到達条件で計算し、ラベルに1回目であることを書く", () => {
    const ntt = makeYutai({
      code: "9432",
      annualValue: 0,
      oneTimeBenefits: [
        { afterYears: 2, value: 1500 },
        { afterYears: 5, value: 3000 },
      ],
      rightsMonths: [3, 9],
      requiredConsecutiveRecords: 5,
      holdingRequirement: "2年以上",
    });
    const est = estimateFirstReceipt(ntt, new Date(2026, 0, 10))!;
    expect(est.qualifyingRightsDate).toEqual({ year: 2028, month: 3 });
    expect(est.label).toBe(
      "今から購入した場合、初回受取見込みは2028年6月頃(保有2年到達時の1回目)"
    );
  });

  it.each([
    ["廃止銘柄", makeYutai({ code: "1", status: "abolished" })],
    ["優待なし", makeYutai({ code: "1", annualValue: 0 })],
    ["基準日なし", makeYutai({ code: "1", rightsMonths: [] })],
    ["記録月が空", makeYutai({ code: "1", recordMonths: [] })],
    // 継続保有条件があるのに判定ルールが無い場合は、早すぎる時期を出さないよう算出しない
    ["継続保有の判定ルール未入力", makeYutai({ code: "1", holdingRequirement: "1年以上" })],
  ])("%s は null", (_label, yutai) => {
    expect(estimateFirstReceipt(yutai, new Date(2026, 0, 10))).toBeNull();
  });
});

describe("表示用の文言", () => {
  it("getHoldingRequirementNotice は照合元によって理由を書き分ける", () => {
    const ir = makeYutai({ code: "1", holdingRequirement: "1年以上", sourceType: "ir" });
    const broker = makeYutai({ code: "2", holdingRequirement: "1年以上", sourceType: "broker" });
    expect(getHoldingRequirementNotice(ir)).toBe(
      "優待の受取には1年以上の継続保有が必要です。公式に判定方法の記載がないため算出していません。"
    );
    expect(getHoldingRequirementNotice(broker)).toBe(
      "優待の受取には1年以上の継続保有が必要です。継続保有の判定方法(株主名簿の記録回数)を確認できていないため、初回受取見込みは算出していません。"
    );
  });

  it("getHoldingRequirementNotice は判定ルールあり・条件なし・優待なしなら null", () => {
    expect(
      getHoldingRequirementNotice(
        makeYutai({ code: "1", holdingRequirement: "1年以上", requiredConsecutiveRecords: 3 })
      )
    ).toBeNull();
    expect(getHoldingRequirementNotice(makeYutai({ code: "2" }))).toBeNull();
    expect(
      getHoldingRequirementNotice(makeYutai({ code: "3", holdingRequirement: "1年以上", annualValue: 0 }))
    ).toBeNull();
  });

  it("formatOneTimeBenefits / formatYearMonth", () => {
    expect(
      formatOneTimeBenefits(
        makeYutai({
          code: "1",
          oneTimeBenefits: [
            { afterYears: 2, value: 1500 },
            { afterYears: 5, value: 3000 },
          ],
        })
      )
    ).toBe("2年保有で1回1,500円相当 / 5年保有で1回3,000円相当");
    expect(formatOneTimeBenefits(makeYutai({ code: "2" }))).toBeNull();
    expect(formatYearMonth({ year: 2027, month: 3 })).toBe("2027年3月");
  });

  it("getAbolishedNotice は廃止の種類と最終権利月で文言を変える", () => {
    expect(getAbolishedNotice(makeYutai({ code: "1" }))).toBeNull();
    expect(isAbolished(makeYutai({ code: "1", status: "abolished" }))).toBe(true);
    expect(getAbolishedNotice(makeYutai({ code: "1", status: "abolished", abolishedKind: "delisted" }))).toBe(
      "上場廃止のため、現在は株式を取得できず株主優待も受けられません"
    );
    expect(getAbolishedNotice(makeYutai({ code: "1", status: "abolished" }))).toBe(
      "株主優待制度は廃止されています"
    );
    expect(getAbolishedNotice(makeYutai({ code: "1", status: "abolished", lastRecordDate: "2025-03" }))).toBe(
      "株主優待は2025年3月権利分をもって廃止されています"
    );
  });
});

// ── 検索 ──────────────────────────────────────────────────────

describe("searchProducts", () => {
  const today = new Date(2026, 0, 10);
  const yutaiList = [
    makeYutai({ code: "1111", name: "アルファHD", annualValue: 3000 }),
    makeYutai({ code: "2222", name: "ベータHD", status: "abolished", lastRecordDate: "2025-03" }),
    makeYutai({ code: "4444", name: "デルタHD", annualValue: 0 }),
    makeYutai({ code: "5555", name: "小売Aストア", brands: ["イプシロン"], annualValue: 2000 }),
    makeYutai({ code: "6666", name: "小売Bストア", annualValue: 0 }),
  ];
  const search = (q: string, list = yutaiList) => searchProducts(q, list, today);

  it("ブランドの完全一致を前方一致より先に並べ、上場+優待ありなら銘柄に解決する", () => {
    const result = search("アルファ");
    expect(result.brandResolutions.map((r) => [r.brand.id, r.isExactMatch])).toEqual([
      ["alpha", true],
      ["alpha2", false],
    ]);
    const alpha = result.brandResolutions[0];
    expect(alpha.kind).toBe("listed-with-yutai");
    expect(alpha.yutai?.code).toBe("1111");
    expect(alpha.statusMessage).toBeNull();
    expect(alpha.firstReceipt).not.toBeNull();
    // ブランド経由で出した銘柄は銘柄データの直接ヒットに重複させない
    expect(result.stockMatches).toEqual([]);
    expect(result.hasAnyResult).toBe(true);
  });

  it("別名・全角英字でもヒットし、ヒットした表記を返す", () => {
    const result = search("ＡＬＰＨＡ");
    expect(result.normalizedQuery).toBe("alpha");
    expect(result.brandResolutions[0].matchedTerm).toBe("alpha");
    expect(result.brandResolutions[0].isExactMatch).toBe(true);
  });

  it("前方一致の強さが同じなら代表表記を優先する", () => {
    const alpha = search("アルファビュ").brandResolutions.find((r) => r.brand.id === "alpha")!;
    expect(alpha.matchedTerm).toBe("アルファ");
    expect(alpha.isExactMatch).toBe(false);
  });

  it.each([
    ["ベータ", "listed-yutai-abolished", "ベータHD(2222): 株主優待は2025年3月権利分をもって廃止されています"],
    ["ガンマ", "listed-no-yutai", "ガンマ社(3333)は上場していますが、当サイトに株主優待の収録がありません"],
    ["ゼータ", "listed-no-yutai", "ゼータ社は上場していますが、当サイトに株主優待の収録がありません"],
    ["デルタ", "listed-no-yutai", "デルタHD(4444)は現在、株主優待の実施情報がありません"],
    ["イプシロン", "unlisted", "イプシロン社は非上場のため株主優待はありません"],
  ])("%s は %s として理由を返す(0件で黙らない)", (query, kind, message) => {
    const resolution = search(query).brandResolutions[0];
    expect(resolution.kind).toBe(kind);
    expect(resolution.statusMessage).toBe(message);
    expect(resolution.firstReceipt).toBeNull();
  });

  it("メーカーが非上場でも、優待を実施している小売への導線を返す", () => {
    const result = search("イプシロン");
    const relays = result.brandResolutions[0].retailerRelays;
    expect(relays.map((r) => [r.retailer.code, r.yutai.code, r.note])).toEqual([
      ["5555", "5555", "一部店舗のみ"],
    ]);
    expect(relays[0].firstReceipt).not.toBeNull();
    // 小売銘柄はブランド名でも直接ヒットするが、導線で出したので重複させない
    expect(result.stockMatches).toEqual([]);
  });

  it("銘柄データを直接検索し、一致の強さ → 年間価値の順に並べる", () => {
    const list = [
      makeYutai({ code: "S1", name: "外食", categories: ["外食"], annualValue: 1000 }),
      makeYutai({ code: "S2", name: "外食チェーン", annualValue: 50000 }),
      makeYutai({ code: "S3", categories: ["外食"], annualValue: 9000 }),
      makeYutai({ code: "S4", categories: ["外食"], annualValue: 0 }), // 優待なし → 出さない
      makeYutai({ code: "S5", categories: ["外食"], annualValue: 0, status: "abolished" }), // 廃止 → 出す
      makeYutai({ code: "S6", name: "和風外食店", annualValue: 99999 }), // 部分一致は前方一致より後
    ];
    const result = search("外食", list);
    expect(result.brandResolutions).toEqual([]);
    expect(result.stockMatches.map((m) => m.yutai.code)).toEqual(["S3", "S1", "S5", "S2", "S6"]);
    expect(result.stockMatches.find((m) => m.yutai.code === "S1")!.matchedTerms).toEqual(["外食"]);
    expect(result.stockMatches.find((m) => m.yutai.code === "S5")!.firstReceipt).toBeNull();
  });

  it("証券コードでも検索でき、直接ヒットは最大30件", () => {
    expect(search("1111").stockMatches.map((m) => m.yutai.code)).toEqual(["1111"]);
    const many = Array.from({ length: 35 }, (_, i) =>
      makeYutai({ code: `${9000 + i}`, categories: ["テスト分類"] })
    );
    expect(search("テスト分類", many).stockMatches).toHaveLength(30);
  });

  it("空の入力・ヒットなしは hasAnyResult: false", () => {
    expect(search(" ・ ")).toEqual({
      query: " ・ ",
      normalizedQuery: "",
      brandResolutions: [],
      stockMatches: [],
      hasAnyResult: false,
    });
    expect(search("該当しない語").hasAnyResult).toBe(false);
  });
});
