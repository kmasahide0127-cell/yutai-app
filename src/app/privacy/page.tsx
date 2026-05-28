import { AppHeader } from "@/components/AppHeader";

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
            <p>本サービスは、トラッキング目的の Cookie を一切使用しません。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">4. アクセス解析</h2>
            <p>本サービスは、ベータ版期間中はアクセス解析ツール(Google Analytics 等)を使用していません。将来導入する場合は、本ポリシーを更新の上、ユーザーに通知します。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">5. 第三者への提供</h2>
            <p>本サービスは、ユーザーの情報を第三者に提供することはありません。そもそも、ユーザーの情報を運営者が取得していません。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">6. お問い合わせ</h2>
            <p>
              本ポリシーに関するお問い合わせは、GitHub リポジトリの Issues までお願いします:{" "}
              <a
                href="https://github.com/kmasahide0127-cell/yutai-app/issues"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://github.com/kmasahide0127-cell/yutai-app/issues
              </a>
            </p>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            ポリシー制定日: 2026年5月27日<br />
            最終更新日: 2026年5月27日
          </p>
        </section>
      </div>
    </div>
  );
}
