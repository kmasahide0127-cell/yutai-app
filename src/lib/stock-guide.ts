// 銘柄ページの実用情報(株数ティア表・受け取りまでの流れ・使い方・同カテゴリの代替候補・FAQ)を
// その銘柄の掲載データから組み立てる。
//
// なぜ: 「この銘柄の優待のポイント」(stock-commentary.ts)は順位・中央値の比較が中心で、
// 全銘柄で文型が共通していた。ここでは銘柄ごとに中身が変わる実用情報
// (株数ごとの内容と必要額、次の基準日と権利付最終日の日付、名簿記録のスケジュール、
//  説明文に書かれた受け取り形式、同じ出費に使える他銘柄との差)を出す。
//
// 制約(CLAUDE.md「法的境界」・データ取り扱い):
// - 数値はすべて掲載データ(yutai-data.ts)からの算出。データにない条件(有効期限・利用店舗の範囲など)は書かない。
// - 売買を勧める表現・将来の予測は書かない。代替候補は「同じ出費カテゴリの掲載銘柄」という事実の提示にとどめる。

import {
  hasActiveYutai,
  isAnnualizedYutai,
  formatPriceBasisDate,
  type Yutai,
} from "@/lib/yutai-data";
import {
  EXPENSE_CATEGORY_SLUGS,
  expenseToYutaiMatch,
  getMatchingExpenseCategoriesForYutai,
  getYutaiForExpenseCategory,
  type ExpenseCategory,
} from "@/lib/matching";
import {
  estimateFirstReceipt,
  formatOneTimeBenefits,
  getAbolishedNotice,
  rightsLastTradingDay,
  type YearMonth,
} from "@/lib/product-search";

function yen(v: number): string {
  return `${v.toLocaleString("ja-JP")}円`;
}
function monthList(months: number[]): string {
  return [...months].sort((a, b) => a - b).map((m) => `${m}月`).join("・");
}
function ymText(ym: YearMonth): string {
  return `${ym.year}年${ym.month}月`;
}
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
function dateText(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS[d.getDay()]})`;
}

/**
 * 説明文を文に分ける。括弧の中の「。」では区切らない
 * (例: 「(3月末・9月末の名簿に連続3回以上。2026年9月末基準は経過措置で連続2回)」を途中で切らないため)。
 */
function splitSentences(description: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of description) {
    if (ch === "(" || ch === "（") depth++;
    if ((ch === ")" || ch === "）") && depth > 0) depth--;
    buf += ch;
    if (ch === "。" && depth === 0) {
      out.push(buf);
      buf = "";
    }
  }
  if (buf.trim()) out.push(buf);
  return out;
}

/** 説明文の先頭1文。基本の優待内容が書かれている */
function firstSentence(description: string): string {
  return splitSentences(description)[0] ?? description;
}

// ── 1. 株数ティア一覧 ─────────────────────────────

export type ShareTierRow = {
  shares: number;
  /** 説明文から抜き出した、その株数の内容(加工せず原文のまま) */
  content: string;
  /** 年間換算額の表示。最低株数の行だけが当サイトの換算値を持つ */
  annualValueText: string;
  /** 必要投資額の目安 = 1株あたりの株価(approxInvestment ÷ minShares)× 株数 */
  investment: number;
  isBase: boolean;
};

/** 括弧の対応が取れていない端の「(」「)」を落とす(読点で区切った際に片側だけ残るため) */
function trimUnbalanced(s: string): string {
  let t = s.trim().replace(/[、,]$/, "");
  const open = (t.match(/[(（]/g) ?? []).length;
  const close = (t.match(/[)）]/g) ?? []).length;
  if (close > open) t = t.replace(/[)）]+$/, "");
  if (open > close) t = t.replace(/[(（][^()（）]*$/, (m) => m.slice(1)).replace(/[(（]$/, "");
  return t.trim();
}

const SHARES_RE = /([0-9][0-9,]*)株以上/g;

function parseShares(s: string): number {
  return Number(s.replace(/,/g, ""));
}

/**
 * 説明文に書かれた「N株以上」のうち最低株数以外のものを、上位(または下位)ティアとして抜き出す。
 *
 * 説明文を文(。)→節(、)に分け、「N株以上」を含む節から次の「N株以上」を含む節の手前までを
 * そのティアの内容とする。内容は説明文の原文をそのまま使い、金額の換算はしない
 * (説明文の書き方が銘柄ごとに異なり、機械的に換算すると誤った額を出すおそれがあるため)。
 */
export function buildShareTiers(yutai: Yutai): ShareTierRow[] {
  const perShare = yutai.minShares > 0 ? yutai.approxInvestment / yutai.minShares : 0;
  const baseValue = isAnnualizedYutai(yutai)
    ? `${yen(yutai.annualValue)}${yutai.annualValueIsEstimate ? "(当サイト試算)" : ""}`
    : formatOneTimeBenefits(yutai) ?? "—";
  const sentences = splitSentences(yutai.description);
  // 最低株数の行の内容: 「{最低株数}株以上」を含む文があればそれ、なければ先頭の文
  const minLabel = new RegExp(`(^|[^0-9,])${yutai.minShares.toLocaleString("ja-JP")}株|(^|[^0-9,])${yutai.minShares}株`);
  const baseSentence = sentences.find((t) => minLabel.test(t)) ?? sentences[0] ?? yutai.description;
  const rows: ShareTierRow[] = [
    {
      shares: yutai.minShares,
      content: baseSentence.trim(),
      annualValueText: baseValue,
      investment: yutai.approxInvestment,
      isBase: true,
    },
  ];

  const extra = new Map<number, string[]>();
  for (const sentence of sentences.map((t) => t.replace(/。$/, ""))) {
    let current: number | null = null;
    for (const clause of sentence.split("、")) {
      const mentions = [...clause.matchAll(SHARES_RE)].map((m) => parseShares(m[1]));
      if (mentions.length > 0) {
        const n = mentions[0];
        if (n <= 0) {
          current = null;
          continue;
        }
        current = n;
        const list = extra.get(n) ?? [];
        list.push(clause);
        extra.set(n, list);
      } else if (current !== null) {
        extra.get(current)!.push(clause);
      }
    }
  }
  // 基本の文に他の株数の記載も混ざっている場合(例: 「500株以上で〜、1,000株以上で〜」)は、
  // 最低株数の節だけを基本の行の内容にする
  const baseClauses = extra.get(yutai.minShares);
  extra.delete(yutai.minShares);
  const otherMentions = [...rows[0].content.matchAll(SHARES_RE)].filter((m) => parseShares(m[1]) !== yutai.minShares);
  if (baseClauses && otherMentions.length > 0) {
    const firstOther = otherMentions[0].index ?? 0;
    const openBefore = (rows[0].content.slice(0, firstOther).match(/[(（]/g) ?? []).length;
    const closeBefore = (rows[0].content.slice(0, firstOther).match(/[)）]/g) ?? []).length;
    // 他の株数が括弧の外にあるときだけ切り出す(括弧内の補足は基本の内容の一部として残す)
    if (openBefore === closeBefore) rows[0].content = trimUnbalanced(baseClauses.join("、"));
  }
  for (const [shares, clauses] of extra) {
    const content = trimUnbalanced(clauses.join("、"));
    if (!content) continue;
    rows.push({
      shares,
      content,
      annualValueText: "当サイト未換算",
      investment: Math.round(perShare * shares),
      isBase: false,
    });
  }
  return rows.sort((a, b) => a.shares - b.shares);
}

// ── 2. 受け取るまでの流れ ─────────────────────────

export type ReceiptStep = { title: string; body: string };

/**
 * 説明文に月末以外の基準日が書かれている銘柄(例: 「3月20日権利」「6月30日基準」)の基準日。
 * 当サイトの日付計算(estimateFirstReceipt)は月末を基準日とみなすため、
 * 説明文と矛盾した日付を出さないよう、記載がある月はその日から権利付最終日を求める。
 */
export function explicitRecordDays(yutai: Yutai): Map<number, number> {
  const out = new Map<number, number>();
  for (const m of yutai.description.matchAll(/(\d{1,2})月(\d{1,2})日(権利|基準)/g)) {
    out.set(Number(m[1]), Number(m[2]));
  }
  return out;
}

/** 指定日を基準日としたときの権利付最終日(基準日が休日ならその前の営業日から、2営業日前) */
function cumDateForDay(year: number, month: number, day: number): Date {
  const d = new Date(year, month - 1, day);
  const back = () => {
    do d.setDate(d.getDate() - 1);
    while (d.getDay() === 0 || d.getDay() === 6);
  };
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  back();
  back();
  return d;
}

function recordDateLabel(yutai: Yutai, ym: YearMonth): { label: string; cum: Date } {
  const day = explicitRecordDays(yutai).get(ym.month);
  if (day !== undefined) {
    return { label: `${ym.year}年${ym.month}月${day}日`, cum: cumDateForDay(ym.year, ym.month, day) };
  }
  return { label: `${ymText(ym)}末`, cum: rightsLastTradingDay(ym.year, ym.month) };
}

/**
 * 今日から最初の優待を受け取るまでの流れを、その銘柄の条件(権利確定月・名簿記録月・必要記録回数・
 * 発送までの月数)から日付つきで組み立てる。日付の算出は estimateFirstReceipt と同じ規則
 * (権利付最終日 = 月末営業日の2営業日前、祝日は考慮しない)。
 */
export function buildReceiptFlow(yutai: Yutai, today: Date = new Date()): ReceiptStep[] {
  if (!hasActiveYutai(yutai)) return [];
  const steps: ReceiptStep[] = [];
  const est = estimateFirstReceipt(yutai, today);
  const shares = `${yutai.minShares.toLocaleString("ja-JP")}株以上`;

  if (!est) {
    // 継続保有条件があるが判定ルールが未入力 / 基準日が未定
    steps.push({
      title: "条件の確認",
      body: yutai.holdingRequirement
        ? `この銘柄は${yutai.holdingRequirement}の継続保有が条件です。何回・どの月の株主名簿への記録で判定するかを掲載データで確認できていないため、受け取れる時期は算出していません。購入前に企業の案内で判定方法を確認してください。`
        : "掲載データでは基準日を特定できていないため、受け取れる時期は算出していません。",
    });
    if (yutai.rightsMonths.length > 0) {
      steps.push({
        title: "基準日",
        body: `優待の基準日(権利確定月)は${monthList(yutai.rightsMonths)}末です。各基準日の2営業日前(権利付最終日)までに${shares}を買い付けていることが、名簿に記録される前提になります。`,
      });
    }
    return steps;
  }

  const first = est.recordDates[0];
  const firstRec = recordDateLabel(yutai, first);
  steps.push({
    title: "1. 買い付けの期限(権利付最終日)",
    body:
      `今日以降で最初に来る${est.requiredRecords > 1 ? "名簿記録日" : "基準日"}は${firstRec.label}です。` +
      `この日の株主名簿に載るには、権利付最終日の${dateText(firstRec.cum)}(概算)の取引終了までに${shares}を買い付けておく必要があります。` +
      (est.missedCurrentCycle ? "今月の権利付最終日はすでに過ぎているため、今月の基準日は数えていません。" : ""),
  });

  if (est.requiredRecords > 1) {
    const recordMonths = yutai.recordMonths ?? yutai.rightsMonths;
    const schedule = est.recordDates
      .map((ym, i) => {
        const r = recordDateLabel(yutai, ym);
        return `${i + 1}回目 ${r.label}(権利付最終日 ${dateText(r.cum)})`;
      })
      .join("、");
    steps.push({
      title: `2. 継続保有の記録(${yutai.holdingRequirement ?? `${est.requiredRecords}回連続`})`,
      body:
        `継続保有の判定は${monthList(recordMonths)}末の株主名簿で行われ、連続${est.requiredRecords}回の記録が必要です(掲載データの判定ルール)。` +
        `今日買った場合の記録日程は ${schedule} です。各回の基準日に${shares}を保有し続け、途中で名簿から外れないことが条件になります。`,
    });
  } else {
    steps.push({
      title: "2. 権利の確定",
      body:
        `継続保有の条件はないため、${firstRec.label}の名簿に${shares}で記録されれば、その回の優待の対象になります(掲載データ時点)。` +
        "権利付最終日の翌営業日(権利落ち日)以降に売却しても、その基準日の権利は確定済みです。次の基準日も受け取るには、その基準日まで保有している必要があります。",
    });
  }

  const lag = yutai.receiptLagMonths;
  steps.push({
    title: "3. 優待の到着",
    body:
      `条件を満たして最初に対象となる基準日は${recordDateLabel(yutai, est.qualifyingRightsDate).label}で、受取見込みは${ymText(est.estimatedReceipt)}頃です` +
      (lag !== undefined
        ? `(基準日から${lag}ヶ月後に届く・付与されるという掲載データの値で算出)。`
        : "(この銘柄の発送時期は掲載データに記録していないため、基準日から3ヶ月後という当サイトの既定値で概算しています)。") +
      "実際の発送・付与の時期は企業の案内で確認してください。",
  });
  return steps;
}

// ── 3. 使い方 ─────────────────────────────────

export type UsageForm = { form: string; quote: string; note: string };

// 説明文に現れる受け取り形式。note はその形式の一般的な性質だけを書き、
// 有効期限・利用店舗の範囲など説明文にない条件は書かない。
const USAGE_RULES: Array<{ form: string; re: RegExp; note: string }> = [
  { form: "ポイント", re: /ポイント|pt/, note: "対象サービスのポイントとして付与され、そのサービスの支払いなどに充てる形式です。" },
  { form: "食事券・優待券", re: /食事(優待)?券|お食事券|優待券|株主ご?優待券/, note: "対象の店舗やサービスでの支払いに券を充てる形式です。" },
  { form: "割引", re: /割引/, note: "定価から差し引かれる形式のため、受け取れる価値は実際に利用した金額によって変わります。" },
  { form: "商品券・ギフトカード", re: /商品券|ギフトカード|ギフト券|お買物券|買物券|買い物券/, note: "対象の店舗での買い物の支払いに充てる形式です。" },
  { form: "QUOカード・電子ギフト", re: /QUOカード|クオカード|デジタルギフト|電子マネー/, note: "金券・電子ギフトとして受け取る形式です。使える店舗・サービスは発行元の案内で確認してください。" },
  { form: "カタログ・選択制", re: /カタログ|から選択|から1点|選べる|を選択/, note: "複数の品目から選んで申し込む形式で、申込手続きが必要になります。" },
  { form: "自社商品・現物", re: /自社(製品|商品(?!券)|取扱商品)|製品|詰め?合わ?せ|お米|コシヒカリ|筆記具|優待品|(?<!自社)商品(?!券|引換)/, note: "品物が届く形式で、家計では同じ品物を買う出費を置き換える使い方になります。" },
  { form: "乗車券・入場券・招待券", re: /乗車券|乗車証|招待券|入場券|パスポート|鑑賞券|チケット/, note: "1回ごとの利用券で、使う予定がある場合に価値が出る形式です。" },
  { form: "寄付の選択", re: /寄付/, note: "優待の代わりに寄付を選べる形式です。" },
  { form: "プリペイドカード", re: /プリペイド|チャージ|お買物カード/, note: "カードにチャージされた金額を対象店舗の支払いに使う形式です。" },
  { form: "提示型の優待カード", re: /優待カード|オーナーズカード|キャッシュバック/, note: "カードを提示して割引・還元を受ける形式で、受け取れる価値は利用額によって変わります。" },
  { form: "クーポン・利用券", re: /クーポン|無料券|飲食券|利用券|金券|きっぷ|入浴券/, note: "対象の店舗・サービスで券(クーポン)を使う形式です。" },
  { form: "サービス利用料の無料化", re: /ヶ月間無料|ヶ月分|プレミアムサービス|無料利用/, note: "対象サービスの利用料が一定期間かからなくなる形式で、そのサービスを使う場合に価値が出ます。" },
];

/** 括弧の外にある「、」でだけ区切る(引用が括弧の途中で切れないように) */
function splitTopLevelClauses(sentence: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of sentence) {
    if (ch === "(" || ch === "（") depth++;
    if ((ch === ")" || ch === "）") && depth > 0) depth--;
    if (ch === "、" && depth === 0) {
      out.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf);
  return out;
}

function quoteAround(description: string, re: RegExp): string {
  for (const sentence of splitSentences(description)) {
    for (const clause of splitTopLevelClauses(sentence.replace(/。$/, ""))) {
      if (re.test(clause)) return clause.trim();
    }
  }
  return "";
}

/**
 * 説明文に書かれた受け取り形式を、該当箇所の原文の引用つきで返す。
 * 同じ箇所から複数の形式が読み取れる場合(例: 「ポイント(または同額の寄付)」)は1件にまとめる。
 */
export function buildUsageForms(yutai: Yutai): UsageForm[] {
  if (!hasActiveYutai(yutai)) return [];
  const byQuote = new Map<string, UsageForm>();
  for (const rule of USAGE_RULES) {
    if (!rule.re.test(yutai.description)) continue;
    const quote = quoteAround(yutai.description, rule.re);
    if (!quote) continue;
    const prev = byQuote.get(quote);
    if (prev) {
      prev.form += `・${rule.form}`;
      prev.note += rule.note;
    } else {
      byQuote.set(quote, { form: rule.form, quote, note: rule.note });
    }
  }
  return [...byQuote.values()];
}

/** 銘柄が出費カテゴリに入っている根拠(一致した業種ジャンル・ライフスタイルタグ) */
export function explainExpenseMatch(yutai: Yutai, expense: ExpenseCategory): string {
  const mapping = expenseToYutaiMatch[expense];
  const cats = yutai.categories.filter((c) => mapping.categories.includes(c));
  const tags = yutai.lifestyleTags.filter((t) => mapping.tags.includes(t));
  const parts: string[] = [];
  if (cats.length > 0) parts.push(`業種ジャンル「${cats.join("」「")}」`);
  if (tags.length > 0) parts.push(`生活タグ「${tags.slice(0, 3).join("」「")}」`);
  return parts.length > 0 ? `${parts.join("と")}が一致` : "";
}

// ── 4. 同カテゴリの代替候補 ─────────────────────────

export type AlternativeRow = {
  yutai: Yutai;
  expense: ExpenseCategory;
  slug: string;
  line: string;
};

function signedYen(diff: number): string {
  if (diff === 0) return "同額";
  return `${yen(Math.abs(diff))}${diff > 0 ? "多い" : "少ない"}`;
}

/**
 * 同じ出費カテゴリの他の優待実施中銘柄を最大3件。
 * 選び方: その銘柄が属する出費カテゴリのうち銘柄数が最も少ない(=比較の意味が大きい)カテゴリを使い、
 * 年換算できる銘柄の中から必要投資額が近い順(|log(他/自)|が小さい順)に選ぶ。
 * 廃止銘柄では当時の必要投資額との比較に意味がないため、年間優待価値の高い順に選ぶ。
 */
export function getCategoryAlternatives(yutai: Yutai, yutaiList: Yutai[], limit = 3): AlternativeRow[] {
  const expenses = getMatchingExpenseCategoriesForYutai(yutai);
  if (expenses.length === 0) return [];
  const pools = expenses
    .map((e) => ({
      expense: e,
      stocks: getYutaiForExpenseCategory(e, yutaiList, yutaiList.length).filter(
        (y) => y.code !== yutai.code && isAnnualizedYutai(y),
      ),
    }))
    .filter((p) => p.stocks.length >= 2)
    .sort((a, b) => a.stocks.length - b.stocks.length);
  const pool = pools[0];
  if (!pool) return [];

  const active = hasActiveYutai(yutai) && yutai.approxInvestment > 0;
  const picked = active
    ? [...pool.stocks]
        .sort(
          (a, b) =>
            Math.abs(Math.log(a.approxInvestment / yutai.approxInvestment)) -
            Math.abs(Math.log(b.approxInvestment / yutai.approxInvestment)),
        )
        .slice(0, limit)
    : pool.stocks.slice(0, limit);

  return picked.map((y) => {
    const sameMonth = y.rightsMonths.some((m) => yutai.rightsMonths.includes(m));
    const parts = [
      `必要投資額 ${yen(y.approxInvestment)}${active ? `(本銘柄より${signedYen(y.approxInvestment - yutai.approxInvestment)})` : ""}`,
      `権利確定 ${monthList(y.rightsMonths)}${active ? (sameMonth ? "(本銘柄と重なる月あり)" : "(本銘柄と別の月)") : ""}`,
      `年間 ${yen(y.annualValue)}${y.annualValueIsEstimate ? "(試算)" : ""}`,
    ];
    if (y.holdingRequirement) parts.push(`${y.holdingRequirement}の継続保有が条件`);
    return { yutai: y, expense: pool.expense, slug: EXPENSE_CATEGORY_SLUGS[pool.expense], line: parts.join(" / ") };
  });
}

// ── 5. FAQ ──────────────────────────────────

export type FaqItem = { q: string; a: string };

export function buildStockFaq(yutai: Yutai, yutaiList: Yutai[], today: Date = new Date()): FaqItem[] {
  const name = yutai.name;
  const shares = `${yutai.minShares.toLocaleString("ja-JP")}株`;

  if (!hasActiveYutai(yutai)) {
    const faq: FaqItem[] = [
      {
        q: `${name}の株主優待は今も受け取れますか?`,
        a: `受け取れません。${getAbolishedNotice(yutai) ?? "株主優待制度は廃止されています"}(当サイトの記録)。`,
      },
    ];
    if (yutai.rightsMonths.length > 0) {
      faq.push({
        q: `${name}の優待は、制度があった当時どのような条件でしたか?`,
        a: `権利確定月は${monthList(yutai.rightsMonths)}で、最低${shares}以上の保有が対象でした。内容は「${firstSentence(yutai.description)}」と記録しています。`,
      });
    }
    const alts = getCategoryAlternatives(yutai, yutaiList);
    if (alts.length > 0) {
      faq.push({
        q: `同じ出費に使える、実施中の優待はありますか?`,
        a: `「${alts[0].expense}」カテゴリでは、${alts.map((a) => `${a.yutai.name}(${a.yutai.code})`).join("、")}などを掲載しています。各銘柄の条件は銘柄ページで確認できます。`,
      });
    }
    return faq;
  }

  const faq: FaqItem[] = [];
  faq.push({
    q: `${name}の株主優待を受け取るには、いくら必要ですか?`,
    a:
      `最低${shares}以上の保有が条件で、株価基準日(${formatPriceBasisDate(yutai)})の株価で計算した必要投資額の目安は${yen(yutai.approxInvestment)}です。` +
      "株価は日々変わるため、実際の金額は購入時の株価で計算してください。売買手数料は含めていません。",
  });

  const est = estimateFirstReceipt(yutai, today);
  const next = est?.recordDates[0];
  faq.push({
    q: `${name}の権利確定日(基準日)はいつですか?`,
    a:
      `権利確定月は${monthList(yutai.rightsMonths)}で、年${yutai.rightsMonths.length}回です` +
      (explicitRecordDays(yutai).size > 0
        ? `(基準日は優待内容の記載どおり${[...explicitRecordDays(yutai)].map(([m, d]) => `${m}月${d}日`).join("・")})。`
        : "(掲載データでは各月末を基準日として扱っています)。") +
      (next && (est?.requiredRecords ?? 1) === 1
        ? `今日以降で最初の基準日は${recordDateLabel(yutai, next).label}で、権利付最終日は${dateText(recordDateLabel(yutai, next).cum)}頃(祝日を考慮しない概算)です。`
        : ""),
  });

  faq.push({
    q: `${name}の優待に継続保有の条件はありますか?`,
    a: yutai.holdingRequirement
      ? yutai.requiredConsecutiveRecords
        ? `あります。${yutai.holdingRequirement}の継続保有が条件で、${monthList(yutai.recordMonths ?? yutai.rightsMonths)}末の株主名簿に連続${yutai.requiredConsecutiveRecords}回記録される必要があります(掲載データの判定ルール)。`
        : `あります。${yutai.holdingRequirement}の継続保有が条件です。名簿記録の判定方法は掲載データで確認できていないため、企業の案内で確認してください。`
      : `掲載データでは、基本の優待に継続保有の条件はありません。基準日に${shares}以上を保有していれば対象になります。`,
  });

  faq.push({
    q: `${name}の優待はいつ頃届きますか?`,
    a: est
      ? yutai.receiptLagMonths !== undefined
        ? `基準日からおよそ${yutai.receiptLagMonths}ヶ月後に届く(付与される)と記録しています。今日購入した場合の初回受取見込みは${ymText(est.estimatedReceipt)}頃です。`
        : `この銘柄の発送時期は掲載データに記録していません。当サイトでは基準日から3ヶ月後を目安に概算しており、今日購入した場合の初回受取見込みは${ymText(est.estimatedReceipt)}頃です。正確な時期は企業の案内で確認してください。`
      : "継続保有の判定方法が確認できていないため、受取時期は算出していません。",
  });

  return faq;
}
