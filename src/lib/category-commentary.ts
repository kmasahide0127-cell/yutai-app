// 出費カテゴリページの「このカテゴリの優待の傾向」を、掲載データから文章にする。
//
// なぜ: カテゴリページは銘柄リストと月別件数が中心で、カテゴリごとの違いが文章になっていなかった。
// 必要投資額の分布・年2回以上の銘柄の割合・継続保有条件・試算値の割合・検証済み数など、
// カテゴリごとに値が変わる事実だけで書く(売買を勧める表現・将来の予測は書かない)。

import { isAnnualizedYutai, isVerifiedYutai, type Yutai } from "@/lib/yutai-data";
import { getYutaiForExpenseCategory, type ExpenseCategory } from "@/lib/matching";

function yen(v: number): string {
  return `${v.toLocaleString("ja-JP")}円`;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

/** 割合を「約N割」「半数程度」などではなく、件数と%の両方で示す(丸めで事実がぼやけないように) */
function share(n: number, total: number): string {
  return `${n}銘柄(${Math.round((n / total) * 100)}%)`;
}

export function buildExpenseCategoryOverview(expense: ExpenseCategory, yutaiList: Yutai[]): string[] {
  const stocks = getYutaiForExpenseCategory(expense, yutaiList, yutaiList.length);
  const total = stocks.length;
  if (total === 0) return [];

  const s: string[] = [];
  const invs = stocks.map((y) => y.approxInvestment);
  const cheapest = stocks.reduce((a, b) => (b.approxInvestment < a.approxInvestment ? b : a));
  s.push(
    `「${expense}」に対応付けている優待実施中の銘柄は${total}銘柄で、必要投資額の目安は${yen(Math.min(...invs))}〜${yen(Math.max(...invs))}、中央値は${yen(Math.round(median(invs)))}です。` +
      (total > 1 ? `最も少ない金額で対象になるのは${cheapest.name}(${cheapest.code})です。` : ""),
  );

  const under10 = stocks.filter((y) => y.approxInvestment < 100_000).length;
  const twiceOrMore = stocks.filter((y) => y.rightsMonths.length >= 2).length;
  s.push(
    `10万円未満で対象になる銘柄は${share(under10, total)}、権利確定が年2回以上ある銘柄は${share(twiceOrMore, total)}です。`,
  );

  const holding = stocks.filter((y) => y.holdingRequirement).length;
  const estimate = stocks.filter((y) => isAnnualizedYutai(y) && y.annualValueIsEstimate).length;
  const verified = stocks.filter(isVerifiedYutai).length;
  const parts: string[] = [];
  if (holding > 0) parts.push(`継続保有が条件の銘柄が${share(holding, total)}あり、購入後すぐの基準日では受け取れないものが含まれます`);
  else parts.push("継続保有を条件とする銘柄はありません(掲載データ時点)");
  if (estimate > 0) parts.push(`年間優待価値が当サイトの換算による試算の銘柄は${share(estimate, total)}です`);
  s.push(`${parts.join("。")}。企業IR・適時開示で内容を確認した「検証済み」は${total}銘柄中${verified}銘柄です。`);

  const annualized = stocks.filter(isAnnualizedYutai);
  if (annualized.length > 1) {
    const yields = annualized.map((y) => y.yieldPercent);
    s.push(
      `年換算できる${annualized.length}銘柄の優待利回りは${Math.min(...yields)}%〜${Math.max(...yields)}%に分布し、中央値は${Math.round(median(yields) * 10) / 10}%です(株価の基準日により変わります)。`,
    );
  }
  return s;
}
