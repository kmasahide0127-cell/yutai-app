import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "お問い合わせ | 優待アプリ",
  description: "優待アプリへのご意見・ご要望・データ誤り報告はこちらからお送りください。",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">お問い合わせ</h1>

        <section className="space-y-6 text-sm leading-relaxed">
          <p>
            優待アプリに関するご意見・ご要望・データの誤り報告など、
            お気軽にご連絡ください。
          </p>

          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="font-semibold text-base">メールでのお問い合わせ</h2>
            <p className="text-muted-foreground">以下のメールアドレスまでご連絡ください。</p>
            <a
              href="mailto:contact@yutai-match.com"
              className="inline-block font-mono text-primary underline break-all"
            >
              contact@yutai-match.com
            </a>
            <p className="text-xs text-muted-foreground">
              ※ 返信までお時間をいただく場合があります。副業での個人運営のため、ご了承ください。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-base">お問い合わせの種類</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
              <li>優待情報の誤り・更新のご報告</li>
              <li>掲載されていない銘柄のリクエスト</li>
              <li>機能に関するご意見・ご要望</li>
              <li>その他、サイトに関するご連絡</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2">
            <h2 className="font-semibold text-base">GitHub Issues</h2>
            <p className="text-muted-foreground">
              開発に関するご報告・技術的なフィードバックは GitHub Issues もご利用いただけます。
            </p>
            <a
              href="https://github.com/kmasahide0127-cell/yutai-app/issues"
              className="inline-block text-primary underline break-all text-xs"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://github.com/kmasahide0127-cell/yutai-app/issues
            </a>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            ※ 投資に関する個別のご相談・アドバイスには対応しておりません。
            本サービスは情報提供のみを目的としています。
          </p>
        </section>
      </div>
    </div>
  );
}
