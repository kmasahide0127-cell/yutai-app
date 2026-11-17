// 銘柄ページの「この銘柄の優待のポイント」を、その銘柄の掲載データから文章にする。
//
// なぜ: 銘柄ページは数値・バッジ中心で、本文が実質的にデータの羅列になっていた。
// 全銘柄で同じ文面にならないよう、銘柄ごとに値が変わる事実(権利確定月の回数と時期、
// 同じ月に確定する掲載銘柄数、出費カテゴリ内での順位、掲載銘柄全体での位置、継続保有条件、
// 換算方法)を組み合わせ、条件ごとに文を出し分ける。
//
// 文言の制約(CLAUDE.md「法的境界」): 売買を勧める表現・将来の予測は書かない。
// 「掲載データではこういう位置にある」という事実の記述と、確認すべき点の案内にとどめる。

import { hasActiveYutai, isAnnualizedYutai, isVerifiedYutai, type Yutai } from "@/lib/yutai-data";
import {
  EXPENSE_CATEGORY_SLUGS,
  getMatchingExpenseCategoriesForYutai,
  getYutaiForExpenseCategory,
  type ExpenseCategory,
} from "@/lib/matching";

export type CommentaryParagraph = {
  heading: string;
  sentences: string[];
};

/** 出費カテゴリ内での位置(カテゴリページへのリンク表示にも使う) */
export type ExpenseCategoryPosition = {
  expense: ExpenseCategory;
  slug: string;
  stockCount: number;
  /** 必要投資額が低い順の順位(1始まり。同額は同順位) */
  investmentRank: number;
  /** 年間優待価値が高い順の順位(年換算できない銘柄は null) */
  valueRank: number | null;
};

export type StockCommentary = {
  paragraphs: CommentaryParagraph[];
  categoryPositions: ExpenseCategoryPosition[];
};

function yen(v: number): string {
  return `${v.toLocaleString("ja-JP")}円`;
}

function monthList(months: number[]): string {
  return months.map((m) => `${m}月`).join("・");
}

/** 昇順に並べたときの順位(同値は同順位 = 自分より小さい値の件数 + 1) */
function rankAsc(values: number[], v: number): number {
  return values.filter((x) => x < v).length + 1;
}
function rankDesc(values: number[], v: number): number {
  return values.filter((x) => x > v).length + 1;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

/**
 * 掲載銘柄全体の中での位置を4段階で言葉にする。
 * 割合 p = (自分より小さい値の件数) / 全件数。四分位で区切る。
 */
function investmentBand(p: number): string {
  if (p < 0.25) return "掲載銘柄の中では少ない金額から対象になる部類(低い方から25%以内)";
  if (p < 0.5) return "掲載銘柄の中ではやや少なめの水準(中央値より下)";
  if (p < 0.75) return "掲載銘柄の中ではやや多めの水準(中央値より上)";
  return "掲載銘柄の中ではまとまった資金が必要な部類(高い方から25%以内)";
}

/** 2つの権利確定月の間隔を言葉にする(例: 3月と9月 → 半年ごと) */
function describeInterval(months: number[]): string | null {
  if (months.length !== 2) return null;
  const [a, b] = [...months].sort((x, y) => x - y);
  const gap = Math.min(b - a, 12 - (b - a));
  if (gap === 6) return "半年ごとに基準日が来ます";
  return `基準日の間隔は${gap}ヶ月と${12 - gap}ヶ月で、半年ごとではありません`;
}

/**
 * 説明文の先頭1文(「。」まで)を要約として取り出す。
 * description は「100株以上保有で〜。継続保有条件〜。」のように条件→内容→補足の順で書かれているため、
 * 先頭1文が最も基本的な優待内容になる。長すぎる場合は切らずにそのまま使わない(途中で切ると意味が変わるため)。
 */
function firstSentence(description: string): string | null {
  const idx = description.indexOf("。");
  const s = idx >= 0 ? description.slice(0, idx + 1) : description;
  if (s.length < 8 || s.length > 120) return null;
  return s;
}

export function buildStockCommentary(yutai: Yutai, yutaiList: Yutai[]): StockCommentary {
  const active = yutaiList.filter(hasActiveYutai);
  const abolished = !hasActiveYutai(yutai);
  const expenses = getMatchingExpenseCategoriesForYutai(yutai);
  const paragraphs: CommentaryParagraph[] = [];

  // ── 1. 優待の概要 ─────────────────────────────
  {
    const s: string[] = [];
    const brands = yutai.brands.filter((b) => b !== yutai.name).slice(0, 3);
    const categoryText = yutai.categories.length > 0 ? `${yutai.categories.join("・")}分野` : "";
    if (abolished) {
      s.push(
        `${yutai.name}は、当サイトでは${categoryText ? `${categoryText}の` : ""}優待銘柄として掲載していましたが、現在は優待を受け取ることができません。`,
      );
      if (yutai.rightsMonths.length > 0) {
        s.push(
          `制度があった当時の権利確定月は${monthList(yutai.rightsMonths)}で、最低${yutai.minShares.toLocaleString("ja-JP")}株が対象でした。`,
        );
      }
    } else {
      s.push(
        brands.length > 0
          ? `${yutai.name}の株主優待は、${brands.join("・")}${yutai.brands.length > brands.length + 1 ? "など" : ""}に関わる${categoryText ? `${categoryText}の` : ""}優待です。`
          : `${yutai.name}の株主優待は、${categoryText ? `${categoryText}の` : ""}優待です。`,
      );
      const head = firstSentence(yutai.description);
      if (head) s.push(`基本となる内容は「${head.replace(/。$/, "")}」です。`);
      if (isAnnualizedYutai(yutai)) {
        s.push(
          yutai.annualValueIsEstimate
            ? `公式資料に金額の記載がない優待のため、年間${yen(yutai.annualValue)}相当という値は当サイトの換算ルールによる試算です。`
            : `受け取れる優待を1年分に換算すると${yen(yutai.annualValue)}相当になります。`,
        );
      } else if (yutai.oneTimeBenefits && yutai.oneTimeBenefits.length > 0) {
        const parts = yutai.oneTimeBenefits.map((b) => `${b.afterYears}年到達時に${yen(b.value)}相当`);
        s.push(`毎年もらえる優待ではなく、継続保有の節目(${parts.join("、")})に1回ずつ受け取る形式です。`);
      }
    }
    paragraphs.push({ heading: abolished ? "制度があった当時の概要" : "優待の概要", sentences: s });
  }

  // 廃止銘柄は現在の位置づけ(順位・利回り)を出すと誤解を招くため、代替の探し方だけ添えて終える
  if (abolished) {
    if (expenses.length > 0) {
      const counts = expenses.map((e) => `${e}(${getYutaiForExpenseCategory(e, yutaiList, yutaiList.length).length}銘柄)`);
      paragraphs.push({
        heading: "同じ出費に使える、実施中の優待",
        sentences: [
          `この銘柄が対応していた出費カテゴリでは、現在も次の件数の優待実施中銘柄を掲載しています: ${counts.join("、")}。`,
          "各カテゴリのページで、権利確定月の分布とあわせて確認できます。",
        ],
      });
    }
    return { paragraphs, categoryPositions: [] };
  }

  // ── 2. 権利確定月と受け取りのタイミング ─────────────
  {
    const s: string[] = [];
    const months = [...yutai.rightsMonths].sort((a, b) => a - b);
    if (months.length === 1) {
      s.push(`権利確定月は年1回、${months[0]}月末です。`);
    } else if (months.length === 2) {
      const interval = describeInterval(months);
      s.push(`権利確定月は年2回、${monthList(months)}末です。${interval ? `${interval}。` : ""}`);
    } else if (months.length > 2) {
      s.push(`権利確定月は年${months.length}回(${monthList(months)}末)と、掲載銘柄の中では基準日が多い銘柄です。`);
    }
    if (months.length > 0) {
      // 同じ月に権利確定する掲載銘柄数(自身を含む)。月によって偏りが大きいので、その月の混み具合を示す
      const perMonth = months.map((m) => ({ m, n: active.filter((y) => y.rightsMonths.includes(m)).length }));
      const monthTotals = Array.from({ length: 12 }, (_, i) => active.filter((y) => y.rightsMonths.includes(i + 1)).length);
      const busiest = Math.max(...monthTotals);
      const desc =
        perMonth.length === 1
          ? `${perMonth[0].m}月に権利確定する銘柄は${perMonth[0].n}銘柄(本銘柄を含む)`
          : `権利確定する銘柄は${perMonth.map(({ m, n }) => `${m}月が${n}銘柄`).join("、")}(いずれも本銘柄を含む)`;
      const crowded = perMonth.filter(({ n }) => n === busiest).map(({ m }) => m);
      const sparse = perMonth.filter(({ n }) => n <= median(monthTotals) / 2).map(({ m }) => m);
      let tail = "";
      if (crowded.length > 0) tail = `。${monthList(crowded)}は掲載銘柄で最も権利確定が集中する月です`;
      else if (sparse.length > 0) tail = `。${monthList(sparse)}は掲載銘柄の中で権利確定する銘柄が少ない月です`;
      s.push(`当サイトの掲載銘柄(優待実施中${active.length}銘柄)のうち、${desc}です${tail}。`);
    }
    if (yutai.holdingRequirement) {
      s.push(
        `${yutai.holdingRequirement}の継続保有が条件のため、購入後すぐの基準日では受け取れず、所定の回数だけ株主名簿に記録されてから対象になります。`,
      );
    } else {
      s.push(`継続保有の条件はなく、基準日に${yutai.minShares.toLocaleString("ja-JP")}株以上を保有していれば対象になります(掲載データ時点)。`);
    }
    if (yutai.receiptLagMonths !== undefined) {
      s.push(`優待は基準日からおよそ${yutai.receiptLagMonths}ヶ月後に届く(付与される)見込みです。`);
    }
    paragraphs.push({ heading: "権利確定月と受け取りのタイミング", sentences: s });
  }

  // ── 3. 出費カテゴリとの関係 ─────────────────────
  const categoryPositions: ExpenseCategoryPosition[] = expenses.map((expense) => {
    const stocks = getYutaiForExpenseCategory(expense, yutaiList, yutaiList.length);
    const annualized = stocks.filter(isAnnualizedYutai);
    return {
      expense,
      slug: EXPENSE_CATEGORY_SLUGS[expense],
      stockCount: stocks.length,
      investmentRank: rankAsc(stocks.map((y) => y.approxInvestment), yutai.approxInvestment),
      valueRank: isAnnualizedYutai(yutai)
        ? rankDesc(annualized.map((y) => y.annualValue), yutai.annualValue)
        : null,
    };
  });
  {
    const s: string[] = [];
    if (categoryPositions.length === 0) {
      s.push("この優待は、当サイトの出費カテゴリのいずれにも対応付けていません(金券・自社商品以外の特殊な優待など)。");
    } else {
      s.push(
        `この優待は${categoryPositions.map((c) => `「${c.expense}」`).join("")}の出費に対応付けています${categoryPositions.length > 1 ? `(${categoryPositions.length}カテゴリ)` : ""}。`,
      );
      // 銘柄数の少ないカテゴリほど、その中での位置が意味を持つため先に書く。最大2カテゴリまで
      const sorted = [...categoryPositions].sort((a, b) => a.stockCount - b.stockCount).slice(0, 2);
      for (const c of sorted) {
        if (c.stockCount <= 1) {
          s.push(`「${c.expense}」カテゴリで掲載している優待実施中の銘柄は、この銘柄のみです。`);
          continue;
        }
        const valuePart =
          c.valueRank !== null ? `、年間優待価値は高い方から${c.valueRank}番目` : "";
        s.push(
          `「${c.expense}」カテゴリの掲載${c.stockCount}銘柄の中では、必要投資額は低い方から${c.investmentRank}番目${valuePart}です。`,
        );
      }
    }
    const tags = yutai.lifestyleTags.slice(0, 4);
    if (tags.length > 0) {
      s.push(`当サイトでは、この優待を${tags.map((t) => `「${t}」`).join("")}といった生活スタイルに対応付けています。`);
    }
    paragraphs.push({ heading: "出費カテゴリとの関係", sentences: s });
  }

  // ── 4. 掲載銘柄全体での位置 ─────────────────────
  {
    const s: string[] = [];
    const invs = active.map((y) => y.approxInvestment);
    const below = invs.filter((v) => v < yutai.approxInvestment).length;
    s.push(
      `必要投資額の目安${yen(yutai.approxInvestment)}(${yutai.minShares.toLocaleString("ja-JP")}株)は、${investmentBand(below / invs.length)}です(中央値は${yen(Math.round(median(invs)))})。`,
    );
    if (isAnnualizedYutai(yutai)) {
      const yields = active.filter(isAnnualizedYutai).map((y) => y.yieldPercent);
      const med = Math.round(median(yields) * 10) / 10;
      const cmp =
        yutai.yieldPercent > med ? "を上回っています" : yutai.yieldPercent < med ? "を下回っています" : "と同じ水準です";
      s.push(`優待利回り${yutai.yieldPercent}%は、年換算できる掲載銘柄の中央値${med}%${cmp}。`);
      if (yutai.yieldPercent >= 5) {
        s.push(
          "利回りが高く見える場合は、継続保有条件・1人あたりの上限・利用できる店舗や期間などの条件で実際に使える価値が変わることがあるため、優待内容の詳細とあわせて確認してください。",
        );
      }
    }
    s.push(
      isVerifiedYutai(yutai)
        ? `内容は企業IR・適時開示で確認済み(確認日: ${yutai.lastVerified})ですが、株価により必要投資額と利回りは日々変わります。`
        : `内容は企業IRでは未確認の参考情報(取得日: ${yutai.lastVerified})のため、必ず企業の公式情報で最新の内容を確認してください。`,
    );
    paragraphs.push({ heading: "掲載銘柄全体での位置", sentences: s });
  }

  return { paragraphs, categoryPositions };
}
