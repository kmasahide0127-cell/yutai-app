"use client";

import { Suspense, useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { buildGaInitScript, sanitizeAnalyticsUrl } from "@/lib/analytics-url";

// @next/third-parties の GoogleAnalytics は gtag('config', id) をオプションなしで呼び、
// クエリ付きの URL のまま page_view を自動送信してしまう。クエリには入力条件
// (出費カテゴリ・検索語など)が入るため、自前で初期化してサニタイズ済み URL だけを送る。
//
// 順序が重要: gtag.js は読み込まれた時点で dataLayer に config が無いと、生の URL(クエリ込み)で
// page_view とサイト内検索イベントを即送信する(ヘッドレスブラウザで送信内容を確認済み)。
// そのため初期化(js / config)はインラインスクリプトで gtag.js より前に実行し、
// page_view はこのコンポーネントから遷移ごとに明示送信する。

// gtag.js は配列ではなく arguments オブジェクトを積んだものだけをコマンドとして解釈する。
// 引数は型付けのためだけに宣言し、実際には arguments を使う
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]): void {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params -- gtag.js の仕様上 arguments を渡す必要がある
  window.dataLayer.push(arguments);
}

function PageViewTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);
  const lastLocation = useRef<string | null>(null);

  // クエリだけが変わる遷移(/stocks の絞り込み等)も1ページビューとして数えるため、
  // 判定キーには生のクエリを含める。送信値はサニタイズ済みのものだけ
  const key = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;

    const pageLocation = sanitizeAnalyticsUrl(window.location.href);
    if (!pageLocation) return;

    // 初回は初期化スクリプトが config 済み。クライアント遷移では、config の page_location /
    // page_referrer が以後のイベント(スクロール等の拡張計測を含む)に使われるため上書きする
    const isFirstView = lastLocation.current === null;
    const pageReferrer = isFirstView
      ? sanitizeAnalyticsUrl(document.referrer)
      : (lastLocation.current ?? "");
    if (!isFirstView) {
      gtag("config", gaId, {
        send_page_view: false,
        page_location: pageLocation,
        page_referrer: pageReferrer,
      });
    }
    gtag("event", "page_view", {
      page_location: pageLocation,
      page_referrer: pageReferrer,
      page_title: document.title,
    });
    lastLocation.current = pageLocation;
  }, [gaId, key]);

  return null;
}

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      {/* afterInteractive のスクリプトは記述順に実行されるため、初期化を先に置く */}
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: buildGaInitScript(gaId) }}
      />
      <Script
        id="ga-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      {/* useSearchParams は静的生成ページで Suspense 境界が必要 */}
      <Suspense fallback={null}>
        <PageViewTracker gaId={gaId} />
      </Suspense>
    </>
  );
}
