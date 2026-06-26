import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "このサイトについて | 優待マッチ",
  description: "優待マッチの運営者情報・サービス目的・免責事項をご説明します。個人開発による株主優待情報提供サービスです。",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">このサイトについて</h1>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="font-semibold text-base mb-2">サービスの目的</h2>
            <p>
              優待マッチは、「生活から逆引きで株主優待を提案する」個人開発の情報提供サービスです。
              毎月の出費カテゴリ(外食・通信費・交通費など)を入力すると、
              その出費を実質的に削減できる株主優待銘柄を提案します。
            </p>
            <p className="mt-2">
              既存の優待サービスとは異なり、「優待ありき」ではなく「生活ありき」で
              マッチングを行うことで、実際に使える優待を見つけやすくしています。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">運営者</h2>
            <p>
              本サービスは個人開発者が副業として運営しています。
              氏名・住所等の個人情報は公開しておりません。
              お問い合わせは<Link href="/contact" className="text-primary underline">お問い合わせページ</Link>からお願いします。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">データについて</h2>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-1">
              <li>優待データの取得基準日: 2026年5月27日</li>
              <li>収録銘柄数: 242銘柄(うち運営者が高い確度で内容を把握している「検証済み」銘柄: 155銘柄)</li>
              <li>一部データはAIによる推定・参考値を含みます</li>
              <li>優待内容は変更・廃止される場合があります</li>
            </ul>
            <p className="mt-2">
              最新の優待情報は、必ず各企業のIRページや公式発表でご確認ください。
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-5 space-y-2">
            <h2 className="font-semibold text-base">重要な免責事項</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                本サービスは<strong className="text-foreground">情報提供のみを目的</strong>としており、
                投資助言・投資勧誘ではありません。
                金融商品取引法に定める投資助言業には該当しません。
              </li>
              <li>
                個別銘柄の売買推奨・目標株価の提示・将来の投資成果の保証は行いません。
              </li>
              <li>
                <strong className="text-foreground">投資判断はご自身の責任</strong>で行ってください。
                本サービスの情報を利用した投資に伴う損益について、運営者は一切の責任を負いません。
              </li>
              <li>
                優待情報は変更・廃止される場合があります。最新情報は各企業のIR情報をご確認ください。
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">技術情報</h2>
            <p className="text-muted-foreground">
              本サービスはすべてのユーザーデータをブラウザ内(localStorage)に保存し、
              サーバーへの個人情報送信は行いません。
              詳しくは<Link href="/privacy" className="text-primary underline">プライバシーポリシー</Link>をご覧ください。
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">関連ページ</h2>
            <ul className="space-y-1">
              <li><Link href="/terms" className="text-primary underline">利用規約</Link></li>
              <li><Link href="/privacy" className="text-primary underline">プライバシーポリシー</Link></li>
              <li><Link href="/contact" className="text-primary underline">お問い合わせ</Link></li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            ページ更新日: 2026年6月15日
          </p>
        </section>
      </div>
    </div>
  );
}
