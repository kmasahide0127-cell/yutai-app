import Script from "next/script";

export const ADSENSE_CLIENT = "ca-pub-6624294914787679";

/**
 * AdSense の広告タグ。ルートレイアウトには置かず、広告を出してよいページにだけ置く。
 *
 * 入力・ナビゲーションが目的の画面(/onboarding、/experiences の選択画面、/search の入力画面など)には
 * 広告を表示できないため、これらのページではこのコンポーネントを読み込まない。
 * 同じ id の Script は next/script が1回だけ読み込むため、AdUnit と併用しても重複しない。
 */
export function AdSenseScript() {
  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
