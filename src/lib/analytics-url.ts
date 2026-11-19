// GA4 に送る URL(page_location / page_referrer)のサニタイズ。
// /results?expenses=…・/search?q=…・/experiences?exp_…=… などのクエリにはユーザーが選んだ
// 出費カテゴリや検索語が入るため、解析には「オリジン + パス + utm_* パラメータ」だけを送る。
// 入力由来のパラメータは値だけでなく名前ごと落とし、# 以降も送らない。
// utm_* は流入元の計測(キャンペーン)に必要で、ユーザー入力ではないため残す。

/**
 * 解析送信用に URL をサニタイズする。
 * 解釈できない値・空文字は空文字を返す(呼び出し側で「送らない」扱いにする)。
 */
export function sanitizeAnalyticsUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "";
  }

  const utm = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (key.startsWith("utm_")) utm.append(key, value);
  }
  const query = utm.toString();
  return `${url.origin}${url.pathname}${query ? `?${query}` : ""}`;
}

// sanitizeAnalyticsUrl と同じ処理を、HTML に埋め込むインラインスクリプト用の JS ソースとして持つ。
// gtag.js は読み込み時点で dataLayer に config が無いと生の URL で page_view を送るため、
// React の hydration を待たずに(= gtag.js より先に)実行できるインラインで config を積む必要がある。
// 両者の結果が一致することは __tests__/analytics-url.test.ts で同じケースを流して保証している。
export const SANITIZE_ANALYTICS_URL_JS = `function(rawUrl){
  if(!rawUrl)return "";
  var url;
  try{url=new URL(rawUrl);}catch(e){return "";}
  var utm=new URLSearchParams();
  url.searchParams.forEach(function(value,key){if(key.indexOf("utm_")===0)utm.append(key,value);});
  var query=utm.toString();
  return url.origin+url.pathname+(query?"?"+query:"");
}`;

/**
 * GA の初期化インラインスクリプト。js / config(自動 page_view 停止 + サニタイズ済み URL)を
 * gtag.js の読み込み前に dataLayer へ積む。page_view 自体は GoogleAnalytics コンポーネントが送る。
 */
export function buildGaInitScript(gaId: string): string {
  return `window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
var __sanitizeGaUrl=${SANITIZE_ANALYTICS_URL_JS};
gtag("js",new Date());
gtag("config",${JSON.stringify(gaId)},{send_page_view:false,page_location:__sanitizeGaUrl(location.href),page_referrer:__sanitizeGaUrl(document.referrer)});`;
}
