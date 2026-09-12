// 商品名・ブランド名からの逆引き検索
//
// 「ReFa が欲しい」「AR グラスが欲しい」という商品起点の入力を、
// 以下の順で優待銘柄に解決する。
//   1. ブランド辞書(brand-data.ts)でメーカー銘柄を引く
//   2. メーカーが非上場 / 優待なしなら、その商品を買える小売銘柄へリレーする
//   3. あわせて銘柄データ(yutai-data.ts)の銘柄名・ブランド名・カテゴリを直接検索する
//
// 重要な設計方針: 「該当0件」で黙って終わらせない。
// 非上場・優待廃止・優待未収録はいずれも「検索結果なし」ではなく事実として返す。

import { YUTAI_LIST, type Yutai } from "@/lib/yutai-data";
import {
  BRANDS,
  RETAILERS,
  BRAND_RETAILER_LINKS,
  type Brand,
  type Retailer,
} from "@/lib/brand-data";

// ── 表記ゆれの正規化 ──────────────────────────────────────────

/**
 * 検索語とデータ側の表記を突き合わせるための正規化。
 *
 * 1. NFKC: 全角英数 → 半角、半角カナ → 全角カナ("ﾘﾌｬ" → "リファ")
 * 2. 小文字化: "ReFa" / "REFA" / "refa" を同一視
 * 3. カタカナ → ひらがな: "リファ" と "りふぁ" を同一視
 *    (Unicode のカタカナ U+30A1〜U+30F6 はひらがなの 0x60 上に並んでいる)
 * 4. 区切り記号・空白・長音符の除去: "シックス パッド" "リファー" などを吸収
 */
export function normalizeSearchText(raw: string): string {
  return raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/[\s・･ー―‐\-_.,/()[\]「」『』&+]/g, "");
}

/** 正規化後に一致したかを、一致の強さ付きで返す。0 = 不一致 */
function matchStrength(query: string, candidate: string): number {
  const q = normalizeSearchText(query);
  const c = normalizeSearchText(candidate);
  if (!q || !c) return 0;
  if (q === c) return 3;
  if (c.startsWith(q) || q.startsWith(c)) return 2;
  if (c.includes(q) || q.includes(c)) return 1;
  return 0;
}

// ── 取得可能最短日の算出 ──────────────────────────────────────

export type YearMonth = { year: number; month: number };

export type FirstReceiptEstimate = {
  /** 必要な連続名簿記録回数(1 = 継続保有要件なし) */
  requiredRecords: number;
  /** Pass 1 で積み上げた名簿記録日(年月)。継続保有の進み方をそのまま見せる */
  recordDates: YearMonth[];
  /** Pass 2 で確定した「初回に優待の権利が取れる基準日」 */
  qualifyingRightsDate: YearMonth;
  /** 優待が実際に手元に届く見込みの年月 */
  estimatedReceipt: YearMonth;
  /** 今日から何ヶ月後か */
  monthsAway: number;
  /** 表示用の一文 */
  label: string;
  /** 今月の権利確定に間に合わないため翌サイクル起点になった場合 true */
  missedCurrentCycle: boolean;
};

function addMonths(ym: YearMonth, delta: number): YearMonth {
  const zeroBased = ym.year * 12 + (ym.month - 1) + delta;
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1 };
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * その月の権利付最終日(この日までに買えば基準日の株主名簿に載る)を概算する。
 *
 * 基準日は月末、受渡は T+2 のため 権利付最終日 = 月末営業日の2営業日前。
 * 祝日は考慮していないため、月末が祝日に重なる月は実際より1〜2日遅く出る。
 * あくまで「今から買って間に合うか」の目安として使う。
 */
function rightsLastTradingDay(year: number, month: number): Date {
  // 月末から土日を遡って月末営業日を求める
  const cursor = new Date(year, month, 0);
  while (isWeekend(cursor)) cursor.setDate(cursor.getDate() - 1);
  // そこから2営業日前へ
  for (let i = 0; i < 2; i++) {
    cursor.setDate(cursor.getDate() - 1);
    while (isWeekend(cursor)) cursor.setDate(cursor.getDate() - 1);
  }
  return cursor;
}

/**
 * 「今日買った場合、初回に優待を受け取れる見込み時期」を算出する。
 *
 * カレンダー機能(buildBudgetAwareCalendarPackage)と同じ2パス構成をとる。
 *   Pass 1: 名簿記録月(recordMonths)を今日から先に向かって走査し、
 *           継続保有要件を満たすまで必要回数ぶん記録日を積み上げる。
 *           初月だけは権利付最終日を過ぎていないかを確認する。
 *   Pass 2: 要件を満たした時点以降で最初に到来する「優待の基準日」(rightsMonths)を探す。
 *           MTG のように継続保有の判定月(3月・9月)と優待の基準日(9月)がずれる銘柄が
 *           あるため、記録の積み上げと権利確定を分けている。
 *
 * 受取見込み = 基準日 + receiptLagMonths(既定3ヶ月)。
 *
 * 廃止銘柄・優待を実施していない銘柄・基準日が未定の銘柄は null を返す。
 */
export function estimateFirstReceipt(
  yutai: Yutai,
  today: Date = new Date()
): FirstReceiptEstimate | null {
  if (isAbolished(yutai)) return null;
  if (yutai.annualValue <= 0) return null;
  if (!yutai.rightsMonths || yutai.rightsMonths.length === 0) return null;

  const recordMonths = yutai.recordMonths ?? yutai.rightsMonths;
  if (recordMonths.length === 0) return null;
  const requiredRecords = Math.max(1, yutai.requiredConsecutiveRecords ?? 1);
  const lagMonths = yutai.receiptLagMonths ?? 3;

  const start: YearMonth = { year: today.getFullYear(), month: today.getMonth() + 1 };

  // Pass 1: 名簿記録の積み上げ
  const recordDates: YearMonth[] = [];
  let missedCurrentCycle = false;
  // 連続7回 × 半年間隔 = 42ヶ月 を十分にカバーできる走査幅
  const MAX_MONTHS_AHEAD = 120;
  for (let i = 0; i < MAX_MONTHS_AHEAD && recordDates.length < requiredRecords; i++) {
    const ym = addMonths(start, i);
    if (!recordMonths.includes(ym.month)) continue;
    // 今月が記録月でも、権利付最終日を過ぎていればこの回はカウントできない
    if (i === 0 && today > rightsLastTradingDay(ym.year, ym.month)) {
      missedCurrentCycle = true;
      continue;
    }
    recordDates.push(ym);
  }
  if (recordDates.length < requiredRecords) return null;

  // Pass 2: 要件充足後、最初に到来する優待の基準日
  const lastRecord = recordDates[recordDates.length - 1];
  let qualifyingRightsDate: YearMonth | null = null;
  for (let i = 0; i < MAX_MONTHS_AHEAD; i++) {
    const ym = addMonths(lastRecord, i);
    if (yutai.rightsMonths.includes(ym.month)) {
      qualifyingRightsDate = ym;
      break;
    }
  }
  if (!qualifyingRightsDate) return null;

  const estimatedReceipt = addMonths(qualifyingRightsDate, lagMonths);
  const monthsAway =
    (estimatedReceipt.year - start.year) * 12 + (estimatedReceipt.month - start.month);

  return {
    requiredRecords,
    recordDates,
    qualifyingRightsDate,
    estimatedReceipt,
    monthsAway,
    missedCurrentCycle,
    label: `今から購入した場合、初回受取見込みは${estimatedReceipt.year}年${estimatedReceipt.month}月頃`,
  };
}

export function formatYearMonth(ym: YearMonth): string {
  return `${ym.year}年${ym.month}月`;
}

// ── 廃止フラグ ────────────────────────────────────────────────

/** status 未指定の銘柄は active 扱い(既存データを書き換えずに済ませるため) */
export function isAbolished(yutai: Yutai): boolean {
  return yutai.status === "abolished";
}

/**
 * 廃止済み銘柄の表示文言。
 * 「いつの権利分で終わったか」を事実として返す。非表示にはしない。
 */
export function getAbolishedNotice(yutai: Yutai): string | null {
  if (!isAbolished(yutai)) return null;
  if (!yutai.lastRecordDate) return "株主優待制度は廃止されています";
  const [year, month] = yutai.lastRecordDate.split("-");
  return `${year}年${parseInt(month, 10)}月権利分をもって廃止`;
}

// ── 検索 ──────────────────────────────────────────────────────

export type BrandResolutionKind =
  /** 上場メーカー + 優待あり */
  | "listed-with-yutai"
  /** 上場メーカーだが優待は廃止済み */
  | "listed-yutai-abolished"
  /** 上場しているが当サイトに優待の収録がない */
  | "listed-no-yutai"
  /** 非上場 */
  | "unlisted";

export type RetailerRelay = {
  retailer: Retailer;
  yutai: Yutai;
  firstReceipt: FirstReceiptEstimate | null;
  note?: string;
};

export type BrandResolution = {
  brand: Brand;
  kind: BrandResolutionKind;
  /** ヒットした表記(代表表記か別名) */
  matchedTerm: string;
  isExactMatch: boolean;
  yutai?: Yutai;
  firstReceipt: FirstReceiptEstimate | null;
  /** 優待が無い/取れない場合にユーザーへ明示する理由。優待ありなら null */
  statusMessage: string | null;
  /** この商品を買える小売の優待(メーカーが非上場でも残す導線) */
  retailerRelays: RetailerRelay[];
};

export type StockMatch = {
  yutai: Yutai;
  /** ヒットした語(銘柄名・ブランド名・カテゴリ) */
  matchedTerms: string[];
  firstReceipt: FirstReceiptEstimate | null;
};

export type ProductSearchResult = {
  query: string;
  normalizedQuery: string;
  brandResolutions: BrandResolution[];
  stockMatches: StockMatch[];
  /** ブランド・銘柄のいずれかで何か返せたか */
  hasAnyResult: boolean;
};

function findYutaiByCode(code: string, yutaiList: Yutai[]): Yutai | undefined {
  return yutaiList.find((y) => y.code === code);
}

function buildRetailerRelays(
  brand: Brand,
  yutaiList: Yutai[],
  today: Date
): RetailerRelay[] {
  const relays: RetailerRelay[] = [];
  for (const link of BRAND_RETAILER_LINKS) {
    if (link.brandId !== brand.id) continue;
    const retailer = RETAILERS.find((r) => r.code === link.retailerCode);
    if (!retailer) continue;
    const yutai = findYutaiByCode(retailer.code, yutaiList);
    // 小売側に優待が無い(または廃止された)なら導線として意味をなさないので出さない
    if (!yutai || yutai.annualValue <= 0 || isAbolished(yutai)) continue;
    relays.push({
      retailer,
      yutai,
      firstReceipt: estimateFirstReceipt(yutai, today),
      note: link.note,
    });
  }
  return relays;
}

function resolveBrand(
  brand: Brand,
  matchedTerm: string,
  isExactMatch: boolean,
  yutaiList: Yutai[],
  today: Date
): BrandResolution {
  const retailerRelays = buildRetailerRelays(brand, yutaiList, today);
  const base = { brand, matchedTerm, isExactMatch, retailerRelays };

  if (!brand.isListed) {
    return {
      ...base,
      kind: "unlisted",
      firstReceipt: null,
      statusMessage: `${brand.makerCompany}は非上場のため株主優待はありません`,
    };
  }

  const yutai = brand.ticker ? findYutaiByCode(brand.ticker, yutaiList) : undefined;

  if (!yutai) {
    return {
      ...base,
      kind: "listed-no-yutai",
      firstReceipt: null,
      statusMessage: `${brand.makerCompany}${brand.ticker ? `(${brand.ticker})` : ""}は上場していますが、当サイトに株主優待の収録がありません`,
    };
  }

  if (isAbolished(yutai)) {
    return {
      ...base,
      kind: "listed-yutai-abolished",
      yutai,
      firstReceipt: null,
      statusMessage: `${yutai.name}(${yutai.code})の株主優待は${getAbolishedNotice(yutai)}されています`,
    };
  }

  if (yutai.annualValue <= 0) {
    return {
      ...base,
      kind: "listed-no-yutai",
      yutai,
      firstReceipt: null,
      statusMessage: `${yutai.name}(${yutai.code})は現在、株主優待の実施情報がありません`,
    };
  }

  return {
    ...base,
    kind: "listed-with-yutai",
    yutai,
    firstReceipt: estimateFirstReceipt(yutai, today),
    statusMessage: null,
  };
}

/**
 * 商品名・ブランド名・銘柄名での逆引き検索。
 *
 * ブランド辞書のヒットを優先し、そのあとに銘柄データの直接ヒットを並べる。
 * ブランド経由で既に出した銘柄は重複表示しない。
 */
export function searchProducts(
  query: string,
  yutaiList: Yutai[] = YUTAI_LIST,
  today: Date = new Date()
): ProductSearchResult {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return {
      query,
      normalizedQuery,
      brandResolutions: [],
      stockMatches: [],
      hasAnyResult: false,
    };
  }

  // ── ブランド辞書 ──
  const brandHits: Array<{ brand: Brand; term: string; strength: number }> = [];
  for (const brand of BRANDS) {
    let best = { term: brand.brandName, strength: 0 };
    for (const term of [brand.brandName, ...brand.aliases]) {
      const strength = matchStrength(query, term);
      if (strength > best.strength) best = { term, strength };
    }
    if (best.strength > 0) brandHits.push({ brand, term: best.term, strength: best.strength });
  }
  brandHits.sort((a, b) => b.strength - a.strength);

  const brandResolutions = brandHits.map(({ brand, term, strength }) =>
    resolveBrand(brand, term, strength === 3, yutaiList, today)
  );

  // ── 銘柄データの直接検索(銘柄名・証券コード・ブランド名・カテゴリ・ライフスタイルタグ) ──
  // ブランド辞書に載っていない語(「自転車」のようなジャンル語)を拾うための経路。
  const shownCodes = new Set<string>();
  for (const resolution of brandResolutions) {
    if (resolution.yutai) shownCodes.add(resolution.yutai.code);
    for (const relay of resolution.retailerRelays) shownCodes.add(relay.yutai.code);
  }

  const stockHits: Array<{ match: StockMatch; strength: number }> = [];
  for (const yutai of yutaiList) {
    if (shownCodes.has(yutai.code)) continue;
    // 優待を実施していない銘柄は検索に出さない。ただし廃止銘柄は
    // 「廃止された」という事実を返す必要があるので対象に含める。
    if (yutai.annualValue <= 0 && !isAbolished(yutai)) continue;

    const terms = [yutai.name, yutai.code, ...yutai.brands, ...yutai.categories, ...yutai.lifestyleTags];
    const matchedTerms: string[] = [];
    let strength = 0;
    for (const term of terms) {
      const s = matchStrength(query, term);
      if (s > 0) {
        matchedTerms.push(term);
        strength = Math.max(strength, s);
      }
    }
    if (matchedTerms.length === 0) continue;

    stockHits.push({
      match: {
        yutai,
        matchedTerms: Array.from(new Set(matchedTerms)),
        firstReceipt: estimateFirstReceipt(yutai, today),
      },
      strength,
    });
  }

  // 一致の強さ → 年間優待価値の順。廃止銘柄は価値0なので自然に後ろへ回る
  stockHits.sort((a, b) => {
    if (b.strength !== a.strength) return b.strength - a.strength;
    return b.match.yutai.annualValue - a.match.yutai.annualValue;
  });

  const stockMatches = stockHits.slice(0, 30).map((h) => h.match);

  return {
    query,
    normalizedQuery,
    brandResolutions,
    stockMatches,
    hasAnyResult: brandResolutions.length > 0 || stockMatches.length > 0,
  };
}

/** 検索入力の例として画面に出す語(辞書に実際に載っているものから構成) */
export const SEARCH_EXAMPLES = ["ReFa", "SIXPAD", "ARグラス", "ダイソン", "自転車", "ビックカメラ"];
