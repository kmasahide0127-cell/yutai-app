// /guide 配下の読み物(ガイド記事)の一覧。一覧ページ・sitemap・フッター・記事末尾の関連記事で共有する。
//
// 記事の本文は src/app/guide/<slug>/page.tsx に書く。記事中の件数・金額・日付は
// 掲載データ(yutai-data.ts・changelog-data.ts)からビルド時に算出し、本文に数値を直書きしない
// (データ更新のたびに記事の数字が古くなるのを防ぐため)。

export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  /** 記事の内容(文章)を最後に見直した日 */
  updated: string;
};

export const GUIDES: GuideMeta[] = [
  {
    slug: "getting-started",
    title: "株主優待の始め方 — 口座開設から初回受け取りまでの流れ",
    description:
      "証券口座の用意、銘柄の条件(必要株数・権利確定月・継続保有条件)の確認、権利付最終日までの買い付け、優待の到着までを、当サイトの掲載データの実例で順に説明します。",
    updated: "2026-11-18",
  },
  {
    slug: "record-date",
    title: "権利付最終日・権利落ち日と継続保有条件の仕組み",
    description:
      "基準日・権利付最終日・権利落ち日の関係と、「1年以上継続保有」のような条件が株主名簿の記録回数でどう判定されるかを、掲載銘柄の条件を例に説明します。",
    updated: "2026-11-18",
  },
  {
    slug: "calendar",
    title: "年間優待カレンダーの組み立て方 — 権利確定月を分散させる",
    description:
      "掲載銘柄の権利確定月は3月・9月に集中しています。月ごとの件数と、受け取りの時期を分散させるときに見る点、当サイトの診断がカレンダーを組む手順を説明します。",
    updated: "2026-11-18",
  },
  {
    slug: "verification",
    title: "「検証済み」と「参考情報」の違いと、優待情報の確かめ方",
    description:
      "当サイトの「✓ 検証済み」「⚠ 参考情報」の判定基準、年間優待価値が試算になる優待、購入前に企業の一次情報で確認する手順を説明します。",
    updated: "2026-11-18",
  },
  {
    slug: "changes",
    title: "株主優待の変更・廃止はどう起きるか — 更新履歴の実例から",
    description:
      "優待の新設・内容変更・廃止・上場廃止が、当サイトの掲載データでどのように起きたかを更新履歴の実例で整理し、変更に気づくための確認方法を説明します。",
    updated: "2026-11-18",
  },
];

export function getGuide(slug: string): GuideMeta {
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) throw new Error(`unknown guide: ${slug}`);
  return g;
}
