// A8.net等の成果報酬型広告バナー。
// 景品表示法対応のため「PR」表示必須、A8.net規約によりrel="nofollow"必須。
//
// 掲載ルール:
// - 1ページ1本、本文の後に置く。参考情報(未検証)・廃止銘柄のページには出さない。
// - 文言は広告主素材にあるテキストだけを使う(独自の箇条書き・キャンペーン文言は足さない)。
//   期間限定キャンペーン(例: 口座開設プレゼント)は現行か確認できないため載せない。
type BannerItem = {
  href: string;
  trackingPixelSrc: string;
  title: string;
  points: string[];
  cta: string;
};

export type AffiliateBannerKind = "brokerage" | "ideco";

const BANNERS: Record<AffiliateBannerKind, BannerItem> = {
  // 個別株を買うための証券口座。「この銘柄を購入するには証券口座が必要です」の下はこれのみ。
  brokerage: {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+CKHGJ6+1WP2+15RZIR",
    trackingPixelSrc: "https://www17.a8.net/0.gif?a8mat=4B7QWW+CKHGJ6+1WP2+15RZIR",
    title: "【DMM 株】",
    points: [
      "米国株手数料 0ドル〜",
      "国内現物取引 55円〜（25歳以下は実質0円）",
      "取引するほどポイントがたまる（1pt=1円）",
      "最短即日取引スタート",
    ],
    cta: "アカウント登録はこちら →",
  },
  // iDeCo では個別株(優待銘柄)は買えないため、証券口座の案内の文脈には置かない。
  ideco: {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+BMJR1U+3XCC+BXIYQ",
    trackingPixelSrc: "https://www18.a8.net/0.gif?a8mat=4B7QWW+BMJR1U+3XCC+BXIYQ",
    title: "松井証券ではじめるiDeCo",
    points: [],
    cta: "",
  },
};

export default function AffiliateBanner({ kind = "brokerage" }: { kind?: AffiliateBannerKind }) {
  const banner = BANNERS[kind];
  return (
    <div className="glass-card w-full overflow-hidden p-4">
      <span className="inline-block mb-2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground">
        PR
      </span>
      <a
        href={banner.href}
        rel="nofollow noopener noreferrer"
        target="_blank"
        className="block text-sm leading-relaxed hover:underline"
      >
        <span className="block font-semibold">{banner.title}</span>
        {banner.points.length > 0 && (
          <ul className="mt-1.5 space-y-0.5">
            {banner.points.map((point) => (
              <li key={point} className="flex items-start gap-1.5 text-muted-foreground">
                <span className="shrink-0">・</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
        {banner.cta && <span className="block mt-2 font-medium text-primary">{banner.cta}</span>}
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src={banner.trackingPixelSrc}
        alt=""
        className="hidden"
      />
    </div>
  );
}
