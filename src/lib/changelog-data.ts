// 掲載データの更新履歴(/changelog で表示)。
//
// date は「当サイトのデータに反映した日」。制度の廃止日・上場廃止日など出来事そのものの日付は
// detail に書く(確認できていない日付は書かない)。新しい順に並べる必要はない(表示時にソートする)。

export type ChangelogKind = "新設" | "変更" | "廃止" | "上場廃止" | "掲載停止" | "修正";

export type ChangelogEntry = {
  date: string; // YYYY-MM-DD
  kind: ChangelogKind;
  code: string;
  name: string;
  detail: string;
  /** 詳細ページがある場合 true(掲載停止した銘柄はページがない) */
  hasPage: boolean;
};

export const CHANGELOG: ChangelogEntry[] = [
  // ── 2026-11-03 品質改善(上場確認・継続保有条件の見直し) ──
  {
    date: "2026-11-03",
    kind: "掲載停止",
    code: "2624",
    name: "アークス",
    detail:
      "証券コードの誤りを修正するため掲載を停止。2624はETF(iFreeETF 日経225)のコードで、アークスの証券コードは9948(JPX上場銘柄一覧で確認)。優待内容・株価は未確認のため再掲載していません。",
    hasPage: false,
  },
  {
    date: "2026-11-03",
    kind: "掲載停止",
    code: "2226",
    name: "カルビー",
    detail:
      "証券コードの誤りを修正するため掲載を停止。2226は湖池屋のコードで、カルビーの証券コードは2229(JPX上場銘柄一覧で確認)。優待内容・株価は未確認のため再掲載していません。",
    hasPage: false,
  },
  {
    date: "2026-11-03",
    kind: "掲載停止",
    code: "7240",
    name: "NOK",
    detail:
      "JPXの東証上場銘柄一覧(2026年9月末版)に記載がなく、現在の上場状況を確認できなかったため掲載を停止しました。",
    hasPage: false,
  },
  {
    date: "2026-11-03",
    kind: "掲載停止",
    code: "2762",
    name: "SANKO MARKETING FOODS(三光マーケティングフーズ)",
    detail:
      "掲載していた「3,000円分の食事優待券」を確認できず、確認できた100株の優待は20%割引券(金額換算できない形式)だったため掲載を停止しました。表示していた優待利回り47.6%は誤りです。",
    hasPage: false,
  },
  {
    date: "2026-11-03",
    kind: "上場廃止",
    code: "8266",
    name: "イズミヤ",
    detail:
      "2014年5月、エイチ・ツー・オー リテイリングとの株式交換により上場廃止。証券コード8260(井筒屋のコード)として誤って現役銘柄に掲載していたため、正しいコード8266の廃止記録に移しました。",
    hasPage: true,
  },
  {
    date: "2026-11-03",
    kind: "上場廃止",
    code: "3198",
    name: "SFPホールディングス",
    detail:
      "クリエイト・レストランツHDへの吸収合併により上場廃止(JPX上場銘柄一覧 2026年9月末版に記載なし)。株主優待は2026年2月権利分が最後。",
    hasPage: true,
  },
  {
    date: "2026-11-03",
    kind: "修正",
    code: "9432",
    name: "NTT",
    detail:
      "dポイントは保有2年到達時に1,500p、5年到達時に3,000pの各1回のみ(毎年ではない)のため、「年間1,500円・利回り8.4%」の表示を取りやめ、年換算・利回りの対象外にしました。初回受取見込みも継続保有条件(3・6・9・12月末の名簿に連続記録)込みの計算に修正。",
    hasPage: true,
  },
  {
    date: "2026-11-03",
    kind: "修正",
    code: "2702",
    name: "日本マクドナルドHD",
    detail:
      "初回受取見込みを、優待内容に記載の継続保有条件(同一株主番号で6月末・12月末の名簿に3回以上連続記録)込みの計算に修正。",
    hasPage: true,
  },
  {
    date: "2026-11-03",
    kind: "修正",
    code: "3193",
    name: "エターナルホスピタリティG(鳥貴族)",
    detail: "社名表記を「鳥貴族HD」からJPX上場銘柄一覧の現社名に修正。",
    hasPage: true,
  },
  {
    date: "2026-11-03",
    kind: "修正",
    code: "9828",
    name: "Genki Global Dining Concepts(元気寿司)",
    detail: "社名表記を「元気寿司」からJPX上場銘柄一覧の現社名に修正。",
    hasPage: true,
  },
  {
    date: "2026-11-03",
    kind: "修正",
    code: "2207",
    name: "meito(名糖産業)",
    detail: "社名表記を「名糖産業」からJPX上場銘柄一覧の現社名に修正。",
    hasPage: true,
  },
  {
    date: "2026-11-03",
    kind: "修正",
    code: "417A",
    name: "ブルーゾーンHD(ヤオコー)",
    detail: "社名表記を「ヤオコー」からJPX上場銘柄一覧の現社名(持株会社)に修正。",
    hasPage: true,
  },

  // ── 2026-10-22 週次メンテナンス(2巡目) ──
  {
    date: "2026-10-22",
    kind: "廃止",
    code: "7581",
    name: "サイゼリヤ",
    detail: "株主優待制度を廃止(配当に集約)。",
    hasPage: true,
  },
  {
    date: "2026-10-22",
    kind: "上場廃止",
    code: "4917",
    name: "マンダム",
    detail: "MBO(公開買付け・株式併合)により2026年5月15日に東証プライム上場廃止。",
    hasPage: true,
  },
  {
    date: "2026-10-22",
    kind: "上場廃止",
    code: "9384",
    name: "内外トランスライン",
    detail: "TOBにより2025年7月に上場廃止。",
    hasPage: true,
  },
  {
    date: "2026-10-22",
    kind: "上場廃止",
    code: "2899",
    name: "永谷園HD",
    detail: "MBOにより2024年9月27日に上場廃止。",
    hasPage: true,
  },
  {
    date: "2026-10-22",
    kind: "上場廃止",
    code: "3756",
    name: "豆蔵HD",
    detail: "MBOにより2020年6月2日に上場廃止。",
    hasPage: true,
  },
  {
    date: "2026-10-22",
    kind: "上場廃止",
    code: "4659",
    name: "エイジス",
    detail: "TOBにより2026年6月19日に上場廃止。",
    hasPage: true,
  },

  // ── 2026-09-12 ──
  {
    date: "2026-09-12",
    kind: "廃止",
    code: "3333",
    name: "あさひ",
    detail: "株主優待は2023年2月権利分(2023年5月発行分)をもって廃止。",
    hasPage: true,
  },
];

/** 日付の新しい順にまとめる */
export function groupChangelogByDate(entries: ChangelogEntry[] = CHANGELOG) {
  const map = new Map<string, ChangelogEntry[]>();
  for (const e of [...entries].sort((a, b) => b.date.localeCompare(a.date))) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return Array.from(map, ([date, items]) => ({ date, items }));
}
