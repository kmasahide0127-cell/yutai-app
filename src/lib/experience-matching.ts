// 体験提案モードのスコアリング・グルーピングロジック
//
// 逆引きモード(product-search.ts)が「商品名→銘柄」であるのに対し、
// こちらは「したい体験→銘柄」で優待を探す。
//
// ── 14カテゴリ → 体験タグ対応表 ──────────────────────────────────
// 外食・カフェは「その優待で外食できるか」がほぼ1:1で対応するため、
// 該当カテゴリの銘柄(優待実施中)へ安全に一括適用できる。
// 一方、宿泊・交通・スポーツ・レジャー系のカテゴリ(ホテル/旅行/スポーツ等)は
// 同一カテゴリ内にフィットネスクラブ・アパレル・航空券専用優待など
// 体験タグと無関係な銘柄が混在するため、一括適用はせず、
// 各社の優待内容を個別に確認したうえで yutai-data.ts の experienceTags に
// 直接付与している(対応表としての一覧は下記コメント参照)。
//
//   外食       → レストラン
//   カフェ     → レストラン
//   ホテル     → 高級ホテル宿泊(個別確認のうえ付与。フィットネス等は対象外)
//   旅行       → 高級ホテル宿泊・温泉旅館・クルーズ(個別確認。航空券専用優待は対象外)
//   リゾート   → 高級ホテル宿泊・温泉旅館・ゴルフ(個別確認)
//   スポーツ   → ゴルフ・サイクリング(スポーツ用品店のみ。フィットネスクラブは対象外)
//   アウトドア → サイクリング(スポーツ用品店のみ。アパレル専業は対象外)
//   サービス   → スキー(スキー場運営会社のみ、個別確認)
//
// 上記以外の6カテゴリ(EC/通信/金融/医薬/日用品 等)には該当する体験タグがない。

import type { Yutai } from "@/lib/yutai-data";
import { isAbolished } from "@/lib/product-search";
import {
  EXPERIENCE_TAGS,
  getExperienceTagMeta,
  type ExperienceTag,
} from "@/lib/experience-data";

/**
 * 体験タグに対するユーザーの興味状態(3状態)。
 *
 * 「経験あり→除外」を固定ルールにしないため、未経験(まだやったことがない)と
 * また利用したい(すでに好きで続けたい)を対等に「加点」= 含める対象として扱う。
 * 興味なしのタグだけを除外する。
 */
export type ExperienceInterest = "unexperienced" | "want-again" | "not-interested";

export type ExperienceInterestMap = Partial<Record<ExperienceTag, ExperienceInterest>>;

/** 未回答のタグは「未経験」として扱う(=含める)。多くの体験は大半の人が未経験のため、
 *  デフォルトで除外してしまうより「まず見せる」ほうが提案として妥当という判断。 */
export function getInterest(
  interests: ExperienceInterestMap,
  tag: ExperienceTag
): ExperienceInterest {
  return interests[tag] ?? "unexperienced";
}

export type ExperienceSortMode = "amount" | "efficiency";

/**
 * 投資可能額が小さい場合の既定ソートは投資効率(b)。
 * 100万円は、体験提案モードで扱う銘柄(オリエンタルランド等は120万円超)の
 * うち高額な部類がようやく視野に入り始める水準として置いた閾値であり、
 * 厳密な最適値ではなく「小さい/大きい」を分ける目安。
 */
const SMALL_BUDGET_THRESHOLD = 1_000_000;

export function getDefaultSortMode(maxInvestment: number | undefined): ExperienceSortMode {
  if (!maxInvestment || maxInvestment <= SMALL_BUDGET_THRESHOLD) return "efficiency";
  return "amount";
}

export type ExperienceMatch = {
  yutai: Yutai;
  /** (a) 1回あたりの割引額(円) = typicalUnitPrice × discountRate */
  discountAmount: number;
  /** 1回あたりの割引率(0〜1)。年間優待価値をその体験の目安金額と比較して算出した参考値 */
  discountRate: number;
  /** (b) 投資効率 = (a) ÷ 必要投資額。数値が大きいほど少ない投資額で割引を得られる */
  efficiency: number;
  /** ユーザーが入力した投資可能額の範囲内で届く優待かどうか。未入力なら null */
  reachable: boolean | null;
};

/**
 * 銘柄の年間優待価値と、体験1回あたりの目安金額を比較して
 * 「1回あたりの割引額」を算出する。
 *
 * 優待の実態は「年1回・数千円分の金券」であることが多く、必ずしも
 * 1回の利用で全額を使い切れるとは限らないが、家族利用やまとめ利用も
 * ありうるため、上限をtypicalUnitPrice(=1回の目安金額)でキャップした
 * 「その体験1回でどれだけお得になりうるか」の参考値として扱う。
 * 年間優待価値がtypicalUnitPriceを上回っても、割引率が100%を超えることはない。
 */
function computeMatch(yutai: Yutai, tag: ExperienceTag): ExperienceMatch {
  const meta = getExperienceTagMeta(tag);
  const discountAmount = Math.min(yutai.annualValue, meta.typicalUnitPrice);
  const discountRate = meta.typicalUnitPrice > 0 ? discountAmount / meta.typicalUnitPrice : 0;
  const efficiency = yutai.approxInvestment > 0 ? discountAmount / yutai.approxInvestment : 0;

  return { yutai, discountAmount, discountRate, efficiency, reachable: null };
}

function withReachability(match: ExperienceMatch, maxInvestment?: number): ExperienceMatch {
  if (!maxInvestment) return match;
  return { ...match, reachable: match.yutai.approxInvestment <= maxInvestment };
}

/** 特定の体験タグに該当する銘柄を、指定した並び順でスコアリングして返す */
export function getExperienceMatchesForTag(
  tag: ExperienceTag,
  yutaiList: Yutai[],
  sortMode: ExperienceSortMode,
  maxInvestment?: number
): ExperienceMatch[] {
  const matches = yutaiList
    .filter((y) => !isAbolished(y) && y.annualValue > 0)
    .filter((y) => y.experienceTags?.includes(tag))
    .map((y) => withReachability(computeMatch(y, tag), maxInvestment));

  return matches.sort((a, b) =>
    sortMode === "amount" ? b.discountAmount - a.discountAmount : b.efficiency - a.efficiency
  );
}

export type ExperienceTagSection = {
  tag: ExperienceTag;
  interest: ExperienceInterest;
  matches: ExperienceMatch[];
  /** 投資可能額入力時のみ意味を持つ内訳。未入力なら両方 null */
  reachableMatches: ExperienceMatch[] | null;
  unreachableMatches: ExperienceMatch[] | null;
};

/**
 * 全体験タグをユーザーの興味状態で振り分け、興味なしタグを除外したうえで
 * タグごとにグルーピングした結果を返す。
 *
 * 該当銘柄が0件のタグも(興味なしでない限り)セクションとして残し、
 * 呼び出し側で「現在該当する銘柄はありません」と表示できるようにする。
 */
export function buildExperienceSections(
  interests: ExperienceInterestMap,
  yutaiList: Yutai[],
  sortMode: ExperienceSortMode,
  maxInvestment?: number
): ExperienceTagSection[] {
  const sections: ExperienceTagSection[] = [];

  for (const { tag } of EXPERIENCE_TAGS) {
    const interest = getInterest(interests, tag);
    if (interest === "not-interested") continue; // 興味なし = 除外(セクション自体を出さない)

    const matches = getExperienceMatchesForTag(tag, yutaiList, sortMode, maxInvestment);
    const reachableMatches = maxInvestment
      ? matches.filter((m) => m.reachable === true)
      : null;
    const unreachableMatches = maxInvestment
      ? matches.filter((m) => m.reachable === false)
      : null;

    sections.push({ tag, interest, matches, reachableMatches, unreachableMatches });
  }

  return sections;
}

// ── 開発用: 体験タグのカバレッジ確認 ────────────────────────────────

export type ExperienceTagCoverage = {
  tag: ExperienceTag;
  label: string;
  count: number;
  samples: string[];
};

/** 各体験タグに該当する銘柄数を集計する(0件タグの洗い出し用) */
export function getExperienceTagCoverage(yutaiList: Yutai[]): ExperienceTagCoverage[] {
  const active = yutaiList.filter((y) => !isAbolished(y) && y.annualValue > 0);

  return EXPERIENCE_TAGS.map(({ tag, label }) => {
    const matched = active.filter((y) => y.experienceTags?.includes(tag));
    return {
      tag,
      label,
      count: matched.length,
      samples: matched.slice(0, 5).map((y) => y.name),
    };
  });
}

/** 開発用: 体験タグ分布をコンソール出力し、0件タグを警告する */
export function debugExperienceTagCoverage(yutaiList: Yutai[]): void {
  console.log("=== 体験タグ分布 ===");
  const coverage = getExperienceTagCoverage(yutaiList);
  const zeroTags: string[] = [];

  for (const { tag, label, count, samples } of coverage) {
    console.log(`${label}(${tag}): ${count}件 (例: ${samples.join(", ") || "-"})`);
    if (count === 0) zeroTags.push(label);
  }

  if (zeroTags.length > 0) {
    console.log(`⚠ 0件タグ: ${zeroTags.join("、")}`);
  } else {
    console.log("✓ 全タグに最低1銘柄が該当");
  }
}
