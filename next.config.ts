import type { NextConfig } from "next";

// AdSense は配信ドメインが多数かつ流動的なため script-src 等の完全な CSP は張らず、
// 広告と干渉しない範囲(フレーム埋め込み・base/object/form の制限)に絞っている。
const CONTENT_SECURITY_POLICY = [
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  // 古いブラウザ向けのクリックジャッキング対策(frame-ancestors 非対応環境)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Next.js 15.2+ は searchParams を使う動的ページの metadata を、ボット判定されない UA には
  // ストリーミングで <body> 末尾に出す。<head> に title/description/canonical が出ないと
  // 検索エンジン・広告審査で正しく読まれない場合があるため、全 UA でブロッキング出力にする。
  htmlLimitedBots: /.*/,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
