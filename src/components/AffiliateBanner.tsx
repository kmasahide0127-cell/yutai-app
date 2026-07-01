// A8.net等の成果報酬型広告バナー。
// 景品表示法対応のため「PR」表示必須、A8.net規約によりrel="nofollow"必須。
interface AffiliateBannerData {
  id: string;
  href: string;
  trackingPixelSrc: string;
  lines: string[];
  ctaLabel: string;
}

// 新しい提携先が承認され次第、この配列に追加するだけで表示に反映される。
const AFFILIATE_BANNERS: AffiliateBannerData[] = [
  {
    id: "dmm-kabu",
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+CKHGJ6+1WP2+15RZIR",
    trackingPixelSrc: "https://www17.a8.net/0.gif?a8mat=4B7QWW+CKHGJ6+1WP2+15RZIR",
    lines: [
      "資産運用するなら【DMM 株】",
      "・米国株手数料 0ドル〜",
      "・国内現物取引 55円〜（25歳以下は実質0円）",
      "・取引するほどポイントがたまる（1pt=1円）",
      "・最短即日取引スタート",
    ],
    ctaLabel: "アカウント登録で2,000円プレゼントの抽選に参加 →",
  },
  // TODO: SBI証券・楽天証券・松井証券などが承認され次第、ここに追加バナーを挿入
];

export default function AffiliateBanner() {
  return (
    <div className="w-full overflow-hidden space-y-3">
      {AFFILIATE_BANNERS.map((banner) => (
        <div key={banner.id} className="w-full overflow-hidden rounded-xl border border-border bg-card p-4">
          <span className="inline-block mb-2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground">
            PR
          </span>
          <a
            href={banner.href}
            rel="nofollow noopener noreferrer"
            target="_blank"
            className="block text-sm leading-relaxed hover:underline"
          >
            {banner.lines.map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
            <span className="block mt-2 font-medium text-primary">{banner.ctaLabel}</span>
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
