// 出費カテゴリページの編集コンテンツ(選び方・組み合わせ例・FAQ)を、そのカテゴリの掲載データから組み立てる。
//
// なぜ: カテゴリページは統計の要約(category-commentary.ts)と銘柄一覧が中心で、
// 「このカテゴリでは何を見て選ぶとよいか」が書かれていなかった。ここでは
// カテゴリごとに値が変わる事実(価格帯の分布、権利月の偏りと空白月、継続保有条件・年2回・試算値の多さ)を
// 根拠に、確認するとよい観点を並べる。観点の並び順も、そのカテゴリで目立つ特徴から順にする。
//
// 制約(CLAUDE.md「法的境界」): 特定銘柄を勧めない。組み合わせ例は条件に合う一例として示し、
// 推奨ではない旨を必ず添える(表示側)。数値はすべて掲載データからの算出。

import { isAnnualizedYutai, isVerifiedYutai, type Yutai } from "@/lib/yutai-data";
import {
  EXPENSE_CATEGORIES,
  buildExpenseCategoryFacts,
  getYutaiForExpenseCategory,
  type ExpenseCategory,
} from "@/lib/matching";

function yen(v: number): string {
  return `${v.toLocaleString("ja-JP")}円`;
}
function monthList(months: number[]): string {
  return [...months].sort((a, b) => a - b).map((m) => `${m}月`).join("・");
}
function pct(n: number, total: number): number {
  return Math.round((n / total) * 100);
}
function names(stocks: Yutai[], max = 3): string {
  return stocks.slice(0, max).map((y) => `${y.name}(${y.code})`).join("、");
}

export type SelectionPoint = {
  heading: string;
  body: string;
  /** 並び順を決める重み(そのカテゴリで目立つ特徴ほど大きい) */
  weight: number;
};

export function buildSelectionPoints(expense: ExpenseCategory, yutaiList: Yutai[]): SelectionPoint[] {
  const stocks = getYutaiForExpenseCategory(expense, yutaiList, yutaiList.length);
  const total = stocks.length;
  if (total === 0) return [];
  const points: SelectionPoint[] = [];
  const byInv = [...stocks].sort((a, b) => a.approxInvestment - b.approxInvestment);

  // 価格帯: 10万円未満 / 10〜30万円 / 30万円以上
  {
    const low = byInv.filter((y) => y.approxInvestment < 100_000);
    const mid = byInv.filter((y) => y.approxInvestment >= 100_000 && y.approxInvestment < 300_000);
    const high = byInv.filter((y) => y.approxInvestment >= 300_000);
    const bands = [
      { label: "10万円未満", list: low },
      { label: "10万〜30万円", list: mid },
      { label: "30万円以上", list: high },
    ];
    const maxCount = Math.max(...bands.map((b) => b.list.length));
    const mains = bands.filter((b) => b.list.length === maxCount);
    const main = mains[0];
    points.push({
      heading: "使える予算から絞る",
      body:
        `必要投資額の目安で分けると、${bands.map((b) => `${b.label}が${b.list.length}銘柄`).join("、")}で、` +
        (mains.length > 1
          ? `${mains.map((b) => b.label).join("と")}が同数で最も多いカテゴリです。`
          : `${main.label}の銘柄が最も多いカテゴリです。`) +
        (low.length > 0
          ? `10万円未満で対象になるのは${names(low)}${low.length > 3 ? "など" : ""}です。`
          : `最も少ない金額で対象になるのは${byInv[0].name}(${yen(byInv[0].approxInvestment)})で、10万円未満の銘柄はありません。`) +
        "必要投資額は株価基準日の株価で計算した目安のため、購入時の株価で計算し直してください。",
      // 価格帯が偏っているほど「予算で絞る」意味が大きい
      weight: main.list.length / total,
    });
  }

  // 権利確定月の偏りと空白月
  {
    const facts = buildExpenseCategoryFacts(expense, yutaiList);
    if (facts.peak) {
      const peakShare = facts.peak.count / total;
      const empty = facts.emptyMonths.map((e) => e.month);
      points.push({
        heading: "受け取る時期を分散させる",
        body:
          `このカテゴリは${monthList(facts.peak.months)}に権利確定する銘柄が最も多く(${facts.peak.count}銘柄、全体の${pct(facts.peak.count, total)}%)、` +
          (empty.length > 0
            ? `${monthList(empty)}に権利確定する銘柄はありません。`
            : "12ヶ月すべてに権利確定する銘柄があります。") +
          `同じ月の銘柄ばかりを選ぶと受け取りが特定の時期に集中するため、出費が毎月ある場合はこのページの「権利確定月の分布」を見て、別の月の銘柄と組み合わせると年間を通して使えます。`,
        weight: peakShare + empty.length / 12,
      });
    }
  }

  // 継続保有条件
  {
    const holding = stocks.filter((y) => y.holdingRequirement);
    points.push({
      heading: "継続保有の条件を確認する",
      body:
        holding.length > 0
          ? `${total}銘柄のうち${holding.length}銘柄(${pct(holding.length, total)}%)は、${names(holding)}${holding.length > 3 ? "など" : ""}のように継続保有が条件です。` +
            "これらは購入直後の基準日では受け取れず、所定の回数だけ株主名簿に記録されてから対象になります。銘柄ページの「受け取るまでの流れ」で、今日買った場合の記録日程を確認できます。"
          : `このカテゴリの${total}銘柄には、基本の優待に継続保有の条件がある銘柄はありません(掲載データ時点)。基準日に必要株数を保有していれば、最初の基準日から対象になります。`,
      weight: holding.length / total,
    });
  }

  // 年2回以上
  {
    const twice = stocks.filter((y) => y.rightsMonths.length >= 2);
    if (twice.length > 0) {
      points.push({
        heading: "年に何回受け取れるかを見る",
        body:
          `権利確定が年2回以上ある銘柄は${twice.length}銘柄(${pct(twice.length, total)}%)で、${names(twice)}${twice.length > 3 ? "など" : ""}が該当します。` +
          "年間優待価値は年間の合計で表示しているため、1回あたりに受け取る量は年間の値を回数で割った目安になります。",
        weight: twice.length / total,
      });
    }
  }

  // 価値の確かさ(試算・検証済み)
  {
    const estimate = stocks.filter((y) => isAnnualizedYutai(y) && y.annualValueIsEstimate);
    const verified = stocks.filter(isVerifiedYutai);
    points.push({
      heading: "年間優待価値の性質と確認状況を見る",
      body:
        (estimate.length > 0
          ? `年間優待価値が当サイトの換算による試算の銘柄が${estimate.length}銘柄(${pct(estimate.length, total)}%)あります。割引券・招待券などは使い方によって実際の価値が変わるため、試算の前提を優待内容の説明で確認してください。`
          : "このカテゴリの年間優待価値は、すべて公式資料の記載額(または記載のある換算)にもとづく値です。") +
        `企業IR・適時開示で内容を確認した「検証済み」は${total}銘柄中${verified.length}銘柄で、それ以外は証券会社の優待ページなどで照合した参考情報です。`,
      weight: estimate.length / total + (total - verified.length) / total / 2,
    });
  }

  return points.sort((a, b) => b.weight - a.weight);
}

// ── 組み合わせ例 ─────────────────────────────

export type ModelCase = {
  stocks: Yutai[];
  totalInvestment: number;
  totalAnnualValue: number;
  months: number[];
};

/**
 * 権利確定月が重ならない銘柄の組み合わせ例を1つ作る。
 *
 * 手順(決定的):
 *   1. 年換算できる銘柄を必要投資額の安い順に並べる(他カテゴリの例で使った銘柄は後回し。下記)
 *   2. 先頭から順に、既に選んだ銘柄と権利確定月が1つも重ならない銘柄を採用する
 *   3. 3銘柄に達するか候補が尽きたら終了
 * 「少ない投資額で受け取り時期を分散させる」という条件に合う一例であり、価値の高さでは選んでいない。
 */
function pickDisjoint(candidates: Yutai[], size: number): Yutai[] {
  const picked: Yutai[] = [];
  const used = new Set<number>();
  for (const y of candidates) {
    if (picked.length >= size) break;
    if (y.rightsMonths.some((m) => used.has(m))) continue;
    picked.push(y);
    y.rightsMonths.forEach((m) => used.add(m));
  }
  return picked;
}

function modelCaseFor(expense: ExpenseCategory, yutaiList: Yutai[], exclude: Set<string>, size: number): Yutai[] {
  const candidates = getYutaiForExpenseCategory(expense, yutaiList, yutaiList.length)
    .filter(isAnnualizedYutai)
    .sort((a, b) => a.approxInvestment - b.approxInvestment || a.code.localeCompare(b.code));
  // 他カテゴリの例で使った銘柄を避ける(「小売」のように複数カテゴリに入る銘柄で、どのカテゴリも同じ例になるのを防ぐ)。
  // 避けると2銘柄に満たない場合だけ、避けずに作り直す
  const fresh = pickDisjoint(candidates.filter((y) => !exclude.has(y.code)), size);
  return fresh.length >= 2 ? fresh : pickDisjoint(candidates, size);
}

/**
 * EXPENSE_CATEGORIES の順に各カテゴリの例を作り、前のカテゴリで使った銘柄は後のカテゴリで避ける。
 * どのページから呼んでも同じ結果になるよう、全カテゴリを毎回同じ順で計算する。
 */
export function buildModelCase(expense: ExpenseCategory, yutaiList: Yutai[], size = 3): ModelCase | null {
  const used = new Set<string>();
  let picked: Yutai[] = [];
  for (const e of EXPENSE_CATEGORIES) {
    const p = modelCaseFor(e, yutaiList, used, size);
    p.forEach((y) => used.add(y.code));
    if (e === expense) {
      picked = p;
      break;
    }
  }
  if (picked.length < 2) return null;
  return {
    stocks: picked,
    totalInvestment: picked.reduce((s, y) => s + y.approxInvestment, 0),
    totalAnnualValue: picked.reduce((s, y) => s + y.annualValue, 0),
    months: [...new Set(picked.flatMap((y) => y.rightsMonths))].sort((a, b) => a - b),
  };
}

// ── FAQ ─────────────────────────────────

export type FaqItem = { q: string; a: string };

export function buildCategoryFaq(expense: ExpenseCategory, yutaiList: Yutai[]): FaqItem[] {
  const stocks = getYutaiForExpenseCategory(expense, yutaiList, yutaiList.length);
  if (stocks.length === 0) return [];
  const faq: FaqItem[] = [];

  const cheapest = [...stocks].sort((a, b) => a.approxInvestment - b.approxInvestment)[0];
  faq.push({
    q: `${expense}に使える優待で、最も少ない投資額で対象になる銘柄はどれですか?`,
    a:
      `当サイトの掲載銘柄では${cheapest.name}(${cheapest.code})で、${cheapest.minShares.toLocaleString("ja-JP")}株・必要投資額の目安は${yen(cheapest.approxInvestment)}です` +
      `(権利確定月: ${monthList(cheapest.rightsMonths)}${cheapest.holdingRequirement ? `、${cheapest.holdingRequirement}の継続保有が条件` : ""})。株価により順位は変わります。`,
  });

  const twice = stocks.filter((y) => y.rightsMonths.length >= 2);
  faq.push({
    q: `${expense}に使える優待で、年2回以上受け取れる銘柄はありますか?`,
    a:
      twice.length > 0
        ? `${stocks.length}銘柄中${twice.length}銘柄が年2回以上権利確定します。例: ${twice
            .slice(0, 3)
            .map((y) => `${y.name}(${monthList(y.rightsMonths)})`)
            .join("、")}。`
        : `掲載している${stocks.length}銘柄は、いずれも権利確定が年1回です。`,
  });

  const noHolding = stocks.filter((y) => !y.holdingRequirement);
  faq.push({
    q: `買ってすぐの基準日から受け取れる(継続保有の条件がない)銘柄はどれくらいありますか?`,
    a:
      `${stocks.length}銘柄中${noHolding.length}銘柄は、基本の優待に継続保有の条件がありません(掲載データ時点)。` +
      (stocks.length - noHolding.length > 0
        ? `残りの${stocks.length - noHolding.length}銘柄は継続保有が条件のため、最初の基準日では受け取れません。`
        : ""),
  });
  return faq;
}
