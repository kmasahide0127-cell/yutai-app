import Link from "next/link";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { EXPERIENCE_TAGS, EXPERIENCE_DATA_LAST_UPDATED } from "@/lib/experience-data";
import { getExperienceTagCoverage } from "@/lib/experience-matching";

// /experiences の使い方・探せる体験・計算の前提の説明。体験ごとの件数はデータから数える。
export function ExperienceGuide() {
  const coverage = getExperienceTagCoverage(YUTAI_LIST);
  const totalStocks = new Set(
    YUTAI_LIST.filter((y) => y.status !== "abolished" && y.annualValue > 0 && (y.experienceTags?.length ?? 0) > 0).map((y) => y.code),
  ).size;
  return (
    <section className="space-y-4 text-sm leading-relaxed" aria-labelledby="exp-guide-heading">
      <h2 id="exp-guide-heading" className="text-base font-bold">体験から探す機能の使い方と、探せる体験</h2>
      <p className="text-muted-foreground">
        {EXPERIENCE_TAGS.length}種類の体験ごとに、その体験に優待を使える銘柄を対応付けています(体験タグの最終更新 {EXPERIENCE_DATA_LAST_UPDATED})。
        体験のいずれかに対応付けている優待実施中の銘柄は{totalStocks}銘柄で、1つの銘柄が複数の体験に対応することがあります。
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[480px] text-left text-xs">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">体験</th>
              <th scope="col" className="px-3 py-2 font-medium">1回の目安金額</th>
              <th scope="col" className="px-3 py-2 font-medium">対応銘柄数</th>
              <th scope="col" className="px-3 py-2 font-medium">対応銘柄の例</th>
            </tr>
          </thead>
          <tbody>
            {EXPERIENCE_TAGS.map((t) => {
              const c = coverage.find((x) => x.tag === t.tag);
              const samples = YUTAI_LIST.filter(
                (y) => y.status !== "abolished" && y.annualValue > 0 && y.experienceTags?.includes(t.tag),
              ).slice(0, 2);
              return (
                <tr key={t.tag} className="border-t border-border align-top">
                  <td className="px-3 py-2">{t.emoji} {t.label}</td>
                  <td className="px-3 py-2 tabular-nums">{t.typicalUnitPrice.toLocaleString()}円</td>
                  <td className="px-3 py-2 tabular-nums">{c?.count ?? 0}</td>
                  <td className="px-3 py-2">
                    {samples.length > 0
                      ? samples.map((y, i) => (
                          <span key={y.code}>
                            {i > 0 && "、"}
                            <Link href={`/stocks/${y.code}`} className="text-primary underline">{y.name}</Link>
                          </span>
                        ))
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">使い方</h3>
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>体験ごとに「未経験」「また利用したい」「興味なし」を選びます。「興味なし」を選んだ体験だけが候補から外れます。</li>
          <li>投資可能額を入れると、その金額以内で対象になる「届く特典」と、それを超える「届かない特典」に分けて表示します。</li>
          <li>並び順は「1回あたりの割引額」と「投資効率」を切り替えられます。</li>
        </ol>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">割引額・投資効率の計算</h3>
        <p className="text-muted-foreground">
          1回あたりの割引額 = 年間優待価値と体験1回の目安金額(上の表)の小さい方、投資効率 = 1回あたりの割引額 ÷ 必要投資額 です。
          目安金額は当サイトが置いた概算で、実際の利用額や割引の条件は施設・プランによって異なります。
          優待の具体的な使い方は各銘柄ページの「優待の使い方」と、企業の案内で確認してください。
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        生活の出費から探す場合は<Link href="/expense" className="text-primary underline">出費カテゴリ</Link>、
        商品名から探す場合は<Link href="/search" className="text-primary underline">商品名で探す</Link>が使えます。
      </p>
    </section>
  );
}
