// A8.net等の成果報酬型広告バナー。
// 景品表示法対応のため「PR」表示必須、A8.net規約によりrel="nofollow"必須。
type BannerItem = {
  href: string;
  trackingPixelSrc: string;
  title: string;
  points: string[];
  cta: string;
};

// 新しい提携先が承認され次第、この配列に追加するだけで表示に反映される。
const BANNERS: BannerItem[] = [
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+CKHGJ6+1WP2+15RZIR",
    trackingPixelSrc: "https://www17.a8.net/0.gif?a8mat=4B7QWW+CKHGJ6+1WP2+15RZIR",
    title: "【DMM 株】口座開設で2,000円プレゼント抽選",
    points: [
      "米国株手数料 0ドル〜",
      "国内現物取引 55円〜（25歳以下は実質0円）",
      "取引するほどポイントがたまる（1pt=1円）",
      "最短即日取引スタート",
    ],
    cta: "アカウント登録はこちら →",
  },
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+BMJR1U+3XCC+BXIYQ",
    trackingPixelSrc: "https://www18.a8.net/0.gif?a8mat=4B7QWW+BMJR1U+3XCC+BXIYQ",
    title: "【松井証券】iDeCoで老後資産づくり",
    points: [
      "運営管理手数料 0円",
      "豊富な商品ラインナップ",
      "サポート体制充実",
    ],
    cta: "iDeCoを始める →",
  },
  // TODO: SBI証券・楽天証券などが承認され次第ここに追加
];

export default function AffiliateBanner() {
  return (
    <div className="w-full overflow-hidden space-y-3">
      {BANNERS.map((banner) => (
        <div key={banner.href} className="w-full overflow-hidden rounded-xl border border-border bg-card p-4">
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
            <ul className="mt-1.5 space-y-0.5">
              {banner.points.map((point) => (
                <li key={point} className="flex items-start gap-1.5 text-muted-foreground">
                  <span className="shrink-0">・</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
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
      ))}
    </div>
  );
}
