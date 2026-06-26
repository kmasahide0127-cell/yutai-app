import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 優待マッチ",
  description: "優待マッチのプライバシーポリシー。Cookie・AdSense・localStorage の取り扱いを説明しています。",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="font-semibold text-base mb-2">1. 個人情報の取扱方針</h2>
            <p>本サービスは、ユーザーのプライバシー保護を最優先に設計されています。ユーザーが本サービスで入力した情報(興味、出費カテゴリ、ブランド選択など)は、すべてユーザーのブラウザ内(localStorage)にのみ保存され、運営者のサーバーには一切送信されません。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">2. localStorage の使用</h2>
            <p>本サービスは、以下の目的でブラウザの localStorage を使用します:</p>
            <ul className="list-disc list-inside mt-2 ml-2">
              <li>オンボーディングの進捗状態の保存</li>
              <li>ユーザーが選択した出費カテゴリ・ブランドの一時保存</li>
            </ul>
            <p className="mt-2">これらの情報は、ユーザーのブラウザ内にのみ存在し、第三者と共有されることはありません。ブラウザのキャッシュ・データを削除すれば、いつでも消去できます。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">3. Cookie の使用</h2>
            <p>本サービス自体はトラッキング目的のCookieを設置しません。ただし、後述の第三者広告配信サービス(Google AdSense)がCookieを使用することがあります。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">4. アクセス解析</h2>
            <p>本サービスは、現在はアクセス解析ツール(Google Analytics 等)を使用していません。将来導入する場合は、本ポリシーを更新の上、ユーザーに通知します。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">5. 広告配信について(Google AdSense)</h2>
            <p>本サービスでは、Google LLC が提供する広告配信サービス「Google AdSense」を利用しています。Google AdSense は、ユーザーの興味・関心に基づいた広告を表示するため、Cookie や同様の技術を使用することがあります。</p>
            <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
              <li>Google はこれらの Cookie を使用して、当サイトや他のサイトへの訪問に基づいた広告をユーザーに表示します。</li>
              <li>Google の広告に関するプライバシーポリシーについては、<a href="https://policies.google.com/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a>をご参照ください。</li>
              <li>インタレストベース広告の無効化を希望する場合は、<a href="https://www.google.com/settings/ads" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google 広告設定</a>またはブラウザのCookie設定からオプトアウトできます。</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">6. 第三者サービスのリンク</h2>
            <p>本サービスには、外部サイト(企業IRページ、GitHub 等)へのリンクが含まれる場合があります。リンク先のプライバシーポリシーは各サービスのものが適用され、本ポリシーの対象外です。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">7. 第三者への個人情報提供</h2>
            <p>本サービスは、ユーザーの個人情報を第三者に提供することはありません。ユーザーが入力した出費カテゴリ等のデータはブラウザ内にのみ保存され、運営者が取得することはありません。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">8. お問い合わせ</h2>
            <p>
              本ポリシーに関するお問い合わせは、メールまたは GitHub Issues までお願いします。
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li>メール: <a href="mailto:yutaiinfoshare@gmail.com" className="text-primary underline">yutaiinfoshare@gmail.com</a></li>
              <li>GitHub: <a href="https://github.com/kmasahide0127-cell/yutai-app/issues" className="text-primary underline" target="_blank" rel="noopener noreferrer">Issues ページ</a></li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            ポリシー制定日: 2026年5月27日<br />
            最終更新日: 2026年6月26日
          </p>
        </section>
      </div>
    </div>
  );
}
