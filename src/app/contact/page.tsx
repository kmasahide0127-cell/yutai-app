import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "お問い合わせ・よくある質問 | 優待マッチ",
  description: "優待マッチへのよくある質問・お問い合わせ窓口。機能リクエスト・銘柄追加・データ誤りのご報告はこちらからどうぞ。",
  alternates: {
    canonical: "/contact",
  },
};

const CONTACT_FAQ = [
  {
    q: "機能リクエスト・バグ報告はどこにすればいいですか？",
    a: "メール（yutaiinfoshare@gmail.com）またはGitHub Issuesにてご連絡ください。GitHub Issuesは開発者が優先的に確認します。",
  },
  {
    q: "銘柄追加のリクエストはできますか？",
    a: "はい。「銘柄追加リクエスト」の旨を件名に含め、銘柄名・証券コードをメールにてお送りください。すべてに対応できるとは限りませんが、確認の上、優先的に検討します。",
  },
  {
    q: "優待内容が古い・間違っていると思う場合は？",
    a: "データ誤りのご報告を歓迎します。「データ誤り報告」の旨を件名に含め、銘柄名・コード・修正内容をメールにてお知らせください。確認後、速やかに更新します。",
  },
  {
    q: "サイトへの掲載や提携について",
    a: "メディア掲載・情報提携に関するお問い合わせは、メールにて内容をご連絡ください。個別にご回答いたします。",
  },
  {
    q: "広告掲載・パートナーシップについて",
    a: "広告掲載・スポンサーシップ・アフィリエイト提携等のお問い合わせはメールにてご連絡ください。件名に「広告掲載」とご記入ください。",
  },
  {
    q: "プライバシーポリシーはどこで確認できますか？",
    a: "プライバシーポリシーはこちらのページからご確認いただけます。",
    link: { href: "/privacy", label: "プライバシーポリシーを見る" },
  },
  {
    q: "投資に関する相談・アドバイスはできますか？",
    a: "投資に関する個別相談・アドバイスには対応しておりません。本サービスは情報提供のみを目的としており、投資助言・投資勧誘ではありません。",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* タイトル */}
        <header>
          <h1 className="text-2xl font-bold mb-2">お問い合わせ・サポート</h1>
          <p className="text-sm text-muted-foreground">
            よくある質問をご確認のうえ、解決しない場合はメールにてお問い合わせください。
          </p>
        </header>

        {/* よくある質問 */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-bold text-base text-foreground mb-4">
            よくある質問
          </h2>
          <div className="space-y-2">
            {CONTACT_FAQ.map(({ q, a, link }) => (
              <details
                key={q}
                className="border border-border rounded-xl bg-card overflow-hidden"
              >
                <summary className="px-4 py-3 text-sm font-medium text-foreground cursor-pointer select-none flex items-start gap-2 list-none [&::-webkit-details-marker]:hidden">
                  <span className="shrink-0 text-primary font-bold mt-px">Q.</span>
                  <span>{q}</span>
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                  {link && (
                    <Link href={link.href} className="inline-block text-xs text-primary underline">
                      {link.label} →
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* メール */}
        <section aria-labelledby="email-heading">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 id="email-heading" className="font-semibold text-base">メールでのお問い合わせ</h2>
            <p className="text-sm text-muted-foreground">
              上記FAQで解決しない場合は、以下のメールアドレスまでご連絡ください。
            </p>
            <a
              href="mailto:yutaiinfoshare@gmail.com"
              className="inline-block font-mono text-primary underline break-all text-sm"
            >
              yutaiinfoshare@gmail.com
            </a>
            <p className="text-xs text-muted-foreground">
              ※ 副業での個人運営のため、返信までお時間をいただく場合があります。
            </p>
          </div>
        </section>

        {/* お問い合わせの種類 */}
        <section>
          <h2 className="font-semibold text-base mb-3">お問い合わせ受付内容</h2>
          <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground ml-1">
            <li>優待情報の誤り・更新のご報告</li>
            <li>掲載されていない銘柄のリクエスト</li>
            <li>機能に関するご意見・ご要望</li>
            <li>広告・掲載に関するお問い合わせ</li>
            <li>その他、サイトに関するご連絡</li>
          </ul>
        </section>

        {/* GitHub Issues */}
        <section aria-labelledby="github-heading">
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h2 id="github-heading" className="font-semibold text-base">GitHub Issues（技術的なご報告）</h2>
            <p className="text-sm text-muted-foreground">
              バグ報告・技術的なフィードバックはGitHub Issuesもご利用いただけます。
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
        </section>

        <p className="text-xs text-muted-foreground">
          ※ 投資に関する個別のご相談・アドバイスには対応しておりません。
          本サービスは情報提供のみを目的としています。
        </p>
      </div>
    </div>
  );
}
