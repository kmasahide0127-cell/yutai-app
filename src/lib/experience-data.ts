// 体験提案モード用の「体験タグ辞書」(experiencesテーブル)
//
// 目的: 逆引きモード(product-search.ts)が「商品名→銘柄」であるのに対し、
// 体験提案モードは「したい体験→銘柄」で優待を探す。
// ユーザーは10種の体験タグについて「未経験/また利用したい/興味なし」を選び、
// 興味なし以外のタグに該当する銘柄を、割引額または投資効率で並べて提示する。
//
// typicalUnitPrice は「その体験を1回利用するときの目安金額」。
// 銘柄ごとの優待内容(annualValue)と比較して、1回あたりの割引額・投資効率を算出するための
// 基準値として使う。金額は一般的な相場感からの概算であり、実際の利用額は施設・プランにより異なる。

export type ExperienceTag =
  | "cruise"
  | "ferry"
  | "luxury-hotel"
  | "onsen-ryokan"
  | "glamping"
  | "restaurant"
  | "aquarium"
  | "golf"
  | "ski"
  | "cycling";

/** 同行人数の目安(予約・予算感を伝えるための表示用情報) */
export type Companion = "solo" | "couple" | "group";

export type ExperienceTagMeta = {
  tag: ExperienceTag;
  label: string;
  emoji: string;
  /** この体験を1回利用するときの目安金額(円)。割引額・投資効率の算出基準 */
  typicalUnitPrice: number;
  companion: Companion;
  companionLabel: string;
  /** 予約に必要なリードタイムの目安(表示用の一文) */
  leadTime: string;
  /** タグの解釈や注意点の補足 */
  note?: string;
};

export const EXPERIENCE_TAGS: ExperienceTagMeta[] = [
  {
    tag: "cruise",
    label: "クルーズ",
    emoji: "🛳️",
    typicalUnitPrice: 80000,
    companion: "group",
    companionLabel: "グループ",
    leadTime: "数ヶ月前までの予約が目安",
  },
  {
    tag: "ferry",
    label: "フェリー",
    emoji: "⛴️",
    typicalUnitPrice: 15000,
    companion: "couple",
    companionLabel: "1〜2人",
    leadTime: "数日前の予約が目安",
  },
  {
    tag: "luxury-hotel",
    label: "高級ホテル宿泊",
    emoji: "🏨",
    typicalUnitPrice: 30000,
    companion: "couple",
    companionLabel: "2人",
    leadTime: "数週間前の予約が目安",
  },
  {
    tag: "onsen-ryokan",
    label: "温泉旅館",
    emoji: "♨️",
    typicalUnitPrice: 20000,
    companion: "couple",
    companionLabel: "2人",
    leadTime: "数週間前の予約が目安",
  },
  {
    tag: "glamping",
    label: "グランピング",
    emoji: "⛺",
    typicalUnitPrice: 25000,
    companion: "group",
    companionLabel: "グループ",
    leadTime: "数週間前の予約が目安",
  },
  {
    tag: "restaurant",
    label: "レストラン",
    emoji: "🍽️",
    typicalUnitPrice: 5000,
    companion: "couple",
    companionLabel: "2人",
    leadTime: "当日〜数日前の予約が目安",
  },
  {
    tag: "aquarium",
    label: "水族館",
    emoji: "🐠",
    typicalUnitPrice: 2500,
    companion: "group",
    companionLabel: "グループ",
    leadTime: "当日でも入場可",
  },
  {
    tag: "golf",
    label: "ゴルフ",
    emoji: "⛳",
    typicalUnitPrice: 12000,
    companion: "group",
    companionLabel: "グループ",
    leadTime: "数週間前の予約が目安",
  },
  {
    tag: "ski",
    label: "スキー",
    emoji: "🎿",
    typicalUnitPrice: 6000,
    companion: "group",
    companionLabel: "グループ",
    leadTime: "当日でもリフト券購入可",
  },
  {
    tag: "cycling",
    label: "サイクリング",
    emoji: "🚴",
    typicalUnitPrice: 8000,
    companion: "couple",
    companionLabel: "1〜2人",
    leadTime: "当日でも利用可",
  },
];

export function getExperienceTagMeta(tag: ExperienceTag): ExperienceTagMeta {
  const meta = EXPERIENCE_TAGS.find((t) => t.tag === tag);
  if (!meta) throw new Error(`未知の体験タグ: ${tag}`);
  return meta;
}

export const EXPERIENCE_DATA_LAST_UPDATED = "2026-09-12";
