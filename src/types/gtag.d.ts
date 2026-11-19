// gtag.js が読み取るキュー。gtag() の引数(arguments オブジェクト)をそのまま積む
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export {};
