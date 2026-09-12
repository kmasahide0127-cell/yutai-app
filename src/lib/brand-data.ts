// 商品名・ブランド名からの逆引き用の辞書データ
//
// 目的: ユーザーは「ReFa が欲しい」「AR グラスが欲しい」という商品単位で考えるが、
// 株主優待は銘柄単位で存在する。その間を埋めるための対応表。
//
// 2つのリレーを持つ:
//   1. brands    → 製造元(メーカー)の銘柄。上場していれば優待銘柄へ直接解決する。
//   2. retailers → その商品を買える小売の銘柄。メーカーが非上場でも
//                  「買う店の優待」で実質的に安く買える導線を残すため。
//
// brands ⇔ retailers は多対多。1つのブランドが複数の小売で買えるし、
// 1つの小売が多数のブランドを扱う。関係は BRAND_RETAILER_LINKS に分離している。
//
// dataQuality の考え方は yutai-data.ts と同じ。
// 上場・非上場の状態やブランドの取扱状況は変わりうるため、参考情報として扱うこと。

export type BrandDataQuality = "verified" | "ai_generated";

export type Brand = {
  id: string;
  /** 代表表記。画面にはこの表記を出す */
  brandName: string;
  /** 表記ゆれ(カタカナ・英字・略称・関連商品名)。検索時は正規化して突き合わせる */
  aliases: string[];
  /** ブランドを展開している会社名 */
  makerCompany: string;
  /** 上場している場合の証券コード。非上場なら undefined */
  ticker?: string;
  isListed: boolean;
  /** 上場・非上場の根拠や、ユーザーに伝えたい補足 */
  note?: string;
  dataQuality: BrandDataQuality;
  lastVerified: string;
};

export type Retailer = {
  /** 優待を実施している小売銘柄の証券コード(yutai-data.ts の code を参照) */
  code: string;
  retailerName: string;
  aliases: string[];
  /** 優待券・ポイントが使える店舗やネットショップ */
  channels: string[];
  dataQuality: BrandDataQuality;
  lastVerified: string;
};

/** brands ⇔ retailers の多対多関係 */
export type BrandRetailerLink = {
  brandId: string;
  retailerCode: string;
  /** 「一部店舗のみ」などの注意書き */
  note?: string;
};

const V = "verified" as const;
const A = "ai_generated" as const;

export const BRANDS: Brand[] = [
  // ---- MTG(7806): 上場メーカー。ブランド名から銘柄へ直接解決できるケース ----
  {
    id: "refa",
    brandName: "ReFa",
    aliases: ["リファ", "refa", "ReFa CARAT", "リファカラット", "美顔ローラー", "ReFa BEAUTECH", "リファビューテック"],
    makerCompany: "MTG",
    ticker: "7806",
    isListed: true,
    note: "MTG公式オンラインショップの優待ポイントで購入できます。",
    dataQuality: V,
    lastVerified: "2026-09-12",
  },
  {
    id: "sixpad",
    brandName: "SIXPAD",
    aliases: ["シックスパッド", "sixpad", "six pad", "EMS", "シックスパット"],
    makerCompany: "MTG",
    ticker: "7806",
    isListed: true,
    note: "MTG公式オンラインショップの優待ポイントで購入できます。",
    dataQuality: V,
    lastVerified: "2026-09-12",
  },

  // ---- あさひ(3333): 上場しているが優待は廃止済みのケース ----
  {
    id: "cycle-base-asahi",
    brandName: "サイクルベースあさひ",
    aliases: ["あさひ", "cycle base asahi", "自転車屋", "あさひサイクル"],
    makerCompany: "あさひ",
    ticker: "3333",
    isListed: true,
    note: "株主優待は2023年2月権利分をもって廃止されています。",
    dataQuality: V,
    lastVerified: "2026-09-12",
  },

  // ---- 非上場メーカー: 「株主優待なし」を明示したうえで小売リレーへ送るケース ----
  {
    id: "xreal",
    brandName: "XREAL",
    aliases: ["エックスリアル", "xreal", "nreal", "エンリアル", "ARグラス", "arグラス", "スマートグラス", "XREAL One", "XREAL Air"],
    makerCompany: "XREAL(中国)",
    isListed: false,
    note: "ARグラス世界最大手。日本の株式市場には上場しておらず(2026年時点で香港取引所へのIPOを申請中)、株主優待もありません。",
    dataQuality: A,
    lastVerified: "2026-09-12",
  },
  {
    id: "anker",
    brandName: "Anker",
    aliases: ["アンカー", "anker", "Soundcore", "サウンドコア", "Nebula", "ネビュラ", "Eufy", "ユーフィ", "モバイルバッテリー"],
    makerCompany: "アンカー・ジャパン",
    isListed: false,
    note: "日本法人のアンカー・ジャパンは未上場です。親会社 Anker Innovations は中国・深圳証券取引所(創業板)に上場しており、日本株の株主優待の対象ではありません。",
    dataQuality: A,
    lastVerified: "2026-09-12",
  },
  {
    id: "dyson",
    brandName: "Dyson",
    aliases: ["ダイソン", "dyson", "Airwrap", "エアラップ", "Supersonic", "スーパーソニック", "掃除機", "ドライヤー"],
    makerCompany: "ダイソン(英国)",
    isListed: false,
    note: "ダイソンは非上場企業のため、株主優待はありません。",
    dataQuality: A,
    lastVerified: "2026-09-12",
  },
];

export const RETAILERS: Retailer[] = [
  {
    code: "3048",
    retailerName: "ビックカメラ",
    aliases: ["ビックカメラ", "biccamera", "ビック", "ソフマップ", "sofmap", "コジマ", "kojima", "家電量販店", "ビックカメラ.com"],
    channels: ["ビックカメラ各店", "ソフマップ", "コジマ", "ビックカメラ.com(自社ネットショップ)"],
    dataQuality: V,
    lastVerified: "2026-09-12",
  },
];

export const BRAND_RETAILER_LINKS: BrandRetailerLink[] = [
  // ARグラス・家電はメーカーが非上場でも、家電量販店の優待券で買える
  { brandId: "xreal", retailerCode: "3048", note: "ARグラス・スマートグラスの取扱店" },
  { brandId: "anker", retailerCode: "3048" },
  { brandId: "dyson", retailerCode: "3048" },
  // 上場メーカーでも、量販店経由で買う選択肢は併記する
  { brandId: "refa", retailerCode: "3048", note: "一部店舗・取扱商品に限られます" },
  { brandId: "sixpad", retailerCode: "3048", note: "一部店舗・取扱商品に限られます" },
];

export const BRAND_DATA_LAST_UPDATED = "2026-09-12";
