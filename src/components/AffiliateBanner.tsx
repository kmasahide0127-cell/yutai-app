// A8.net等の成果報酬型広告バナー。
// 景品表示法対応のため「PR」表示必須、A8.net規約によりrel="nofollow"必須。
//
// 掲載ルール:
// - 1ページ1本、本文の後に置く。参考情報(未検証)・廃止銘柄のページには出さない。
// - 文言は広告主素材にあるテキストだけを使う(独自の箇条書き・キャンペーン文言は足さない)。
//   期間限定キャンペーン(例: 口座開設プレゼント)は現行か確認できないため載せない。
const BANNER = {
  // 個別株を買うための証券口座。「この銘柄を購入するには証券口座が必要です」の下はこれのみ。
  href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+CKHGJ6+1WP2+15RZIR",
  trackingPixelSrc: "https://www17.a8.net/0.gif?a8mat=4B7QWW+CKHGJ6+1WP2+15RZIR",
  title: "資産運用するなら【DMM 株】",
  cta: "アカウント登録はこちら →",
} as const;

export default function AffiliateBanner() {
  const banner = BANNER;
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
        <span className="block mt-2 font-medium text-primary">{banner.cta}</span>
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
