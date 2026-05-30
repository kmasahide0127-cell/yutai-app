import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "利用規約",
  description: "優待アプリの利用規約をご確認ください。",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">利用規約</h1>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="font-semibold text-base mb-2">第1条(本サービスについて)</h2>
            <p>本サービス「優待アプリ(以下、本サービス)」は、個人が運営する株主優待情報の検索・提案サービスです。本サービスの機能・データ・仕様は予告なく変更される場合があります。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">第2条(投資助言ではないこと)</h2>
            <p>本サービスは情報提供を目的としており、投資助言業に該当する行為(個別銘柄の売買推奨、目標株価の提示等)は行いません。本サービスで提供される情報は、特定の銘柄の購入を推奨するものではありません。投資判断はユーザー自身の責任で行ってください。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">第3条(情報の正確性と取得日)</h2>
            <p>本サービスで提供される優待情報は、運営者が公開情報に基づき手作業で収集したものです。優待情報は2026年5月27日時点のものであり、最新でない可能性があります。優待制度は予告なく変更・廃止される場合があるため、実際の優待内容については、必ず各企業のIRページや公式発表で最新情報をご確認ください。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">第4条(免責事項)</h2>
            <p>本サービスの情報を利用して生じたいかなる損害(投資損失、機会損失、その他経済的損害)についても、運営者は一切の責任を負いません。ユーザーは自己責任で本サービスを利用するものとします。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">第5条(禁止事項)</h2>
            <p>本サービスを利用するにあたり、以下の行為を禁止します:</p>
            <ul className="list-disc list-inside mt-2 ml-2">
              <li>本サービスのデータを商用利用すること</li>
              <li>本サービスに過度な負荷をかける行為</li>
              <li>本サービスを利用した違法行為</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">第6条(規約の変更)</h2>
            <p>運営者は、必要に応じて本規約を変更することができます。変更後の規約は、本サービス上に掲示した時点で効力を生じます。</p>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">第7条(準拠法・管轄)</h2>
            <p>本規約は日本法に準拠し、本サービスに関する一切の紛争については、運営者の居住地を管轄する裁判所を専属的合意管轄裁判所とします。</p>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            規約制定日: 2026年5月27日<br />
            最終更新日: 2026年5月27日<br />
            掲載優待データ取得日: 2026年5月27日
          </p>
        </section>
      </div>
    </div>
  );
}
