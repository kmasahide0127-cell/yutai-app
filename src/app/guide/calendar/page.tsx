import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { GuideArticle, P, Section, StockLink } from "@/components/guide/GuideArticle";
import { getGuide } from "@/lib/guides";
import { YUTAI_LIST, hasActiveYutai, isAnnualizedYutai } from "@/lib/yutai-data";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_SLUGS, buildExpenseCategoryFacts } from "@/lib/matching";

const guide = getGuide("calendar");
export const metadata = buildPageMetadata({ title: guide.title, description: guide.description, path: "/guide/calendar" });

function yen(v: number): string {
  return `${v.toLocaleString("ja-JP")}円`;
}

export default function CalendarGuide() {
  const active = YUTAI_LIST.filter(hasActiveYutai);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const perMonth = months.map((m) => {
    const stocks = active.filter((y) => y.rightsMonths.includes(m));
    const cheapest = stocks.filter(isAnnualizedYutai).sort((a, b) => a.approxInvestment - b.approxInvestment)[0];
    return { m, count: stocks.length, cheapest };
  });
  // 複数月に確定する銘柄は各月で数えるため、合計は銘柄数より多くなる
  const totalSlots = perMonth.reduce((s, p) => s + p.count, 0);
  const sorted = [...perMonth].sort((a, b) => b.count - a.count);
  const top2 = sorted.slice(0, 2);
  const top2Share = Math.round(((top2[0].count + top2[1].count) / totalSlots) * 100);
  const sparse = perMonth.filter((p) => p.count <= 6);
  const timesDist = new Map<number, number>();
  for (const y of active) timesDist.set(y.rightsMonths.length, (timesDist.get(y.rightsMonths.length) ?? 0) + 1);
  const many = active.filter((y) => y.rightsMonths.length >= 3);

  // 出費カテゴリごとに、そのカテゴリの銘柄だけで権利確定月を何ヶ月カバーできるか
  const coverage = EXPENSE_CATEGORIES.map((e) => ({ e, facts: buildExpenseCategoryFacts(e, YUTAI_LIST) })).sort(
    (a, b) => b.facts.coverableMonthCount - a.facts.coverableMonthCount,
  );

  return (
    <GuideArticle slug="calendar">
      <Section id="concentration" title="掲載銘柄の権利確定月は3月・9月に偏っている">
        <P>
          当サイトに掲載している優待実施中の{active.length}銘柄の権利確定月を月ごとに数えると、次の表のとおりです(年2回以上の銘柄は各月で数えています)。
          最も多いのは{top2[0].m}月({top2[0].count}銘柄)と{top2[1].m}月({top2[1].count}銘柄)で、この2ヶ月で全体の{top2Share}%を占めます。
          一方、{sparse.map((p) => `${p.m}月`).join("・")}は6銘柄以下です。
        </P>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[460px] text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">権利確定月</th>
                <th scope="col" className="px-3 py-2 font-medium">掲載銘柄数</th>
                <th scope="col" className="px-3 py-2 font-medium">必要投資額が最も少ない銘柄(目安)</th>
              </tr>
            </thead>
            <tbody>
              {perMonth.map((p) => (
                <tr key={p.m} className="border-t border-border">
                  <td className="px-3 py-2">{p.m}月</td>
                  <td className="px-3 py-2 tabular-nums">{p.count}</td>
                  <td className="px-3 py-2">
                    {p.cheapest ? (
                      <>
                        <StockLink code={p.cheapest.code} name={p.cheapest.name} /> {yen(p.cheapest.approxInvestment)}
                        {p.cheapest.holdingRequirement ? `(${p.cheapest.holdingRequirement}の継続保有が条件)` : ""}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          表の右列は、その月に権利確定する銘柄の中で株価基準日時点の必要投資額が最も少ない銘柄を機械的に示したもので、優待の内容や価値で選んだものではありません。
        </P>
      </Section>

      <Section id="times" title="年に何回受け取れるか">
        <P>
          権利確定が年1回の銘柄は{timesDist.get(1) ?? 0}銘柄、年2回の銘柄は{timesDist.get(2) ?? 0}銘柄
          {many.length > 0 && (
            <>
              、年3回以上の銘柄は{many.length}銘柄(
              {many.map((y, i) => (
                <span key={y.code}>{i > 0 && "、"}<StockLink code={y.code} name={y.name} />: {y.rightsMonths.join("・")}月</span>
              ))}
              )
            </>
          )}
          です。年2回の銘柄の多くは半年ごと(例: 3月と9月)に基準日がありますが、間隔が半年でない銘柄もあります。
          当サイトの年間優待価値は年間の合計なので、1回に受け取る量は年間の値を回数で割った目安になります。
        </P>
      </Section>

      <Section id="how" title="受け取る時期を分散させるときに見る点">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">出費が発生する時期と合わせる</strong>: 食費や日用品のように毎月発生する出費に使う優待は、
            同じ月に集中させるより、権利確定月の異なる銘柄に分けると年間を通して使えます。旅行やレジャーのように使う時期が決まっている出費は、
            その時期に有効な優待かどうか(到着時期と有効期限)を確認します。
          </li>
          <li>
            <strong className="text-foreground">継続保有条件で初回が遅れる</strong>: 条件のある銘柄は、権利確定月が来ても最初の数回は受け取れません。
            カレンダーを考えるときは、各銘柄ページの「受け取るまでの流れ」に出る初回の基準日を使います。
          </li>
          <li>
            <strong className="text-foreground">合計の必要投資額</strong>: 銘柄を増やすほど必要な資金の合計が増えます。月をすべて埋めることを目的にすると、
            使わない優待が含まれやすくなります。
          </li>
        </ol>
      </Section>

      <Section id="by-category" title="出費カテゴリごとにカバーできる月数">
        <P>
          出費カテゴリごとに、そのカテゴリの銘柄だけで権利確定月を最大何ヶ月カバーできるかを数えると次のとおりです。
          カバーできない月は、各カテゴリページの「権利確定月の分布」に、その月を埋められる他のカテゴリとあわせて表示しています。
        </P>
        <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          {coverage.map(({ e, facts }) => (
            <li key={e} className="rounded-md border border-border bg-card px-3 py-1.5">
              <Link prefetch={false} href={`/expense/${EXPENSE_CATEGORY_SLUGS[e]}`} className="text-primary underline">{e}</Link>
              <span className="text-xs text-muted-foreground"> — {facts.stockCount}銘柄で{facts.coverableMonthCount}ヶ月</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="tool" title="当サイトの診断がカレンダーを組む手順">
        <P>
          <Link href="/onboarding" className="text-primary underline">生活から診断</Link>では、選んだ出費カテゴリの銘柄を候補に、予算内で
          (1) 1銘柄が予算の15%以下の候補から、安く埋められる月の順に各月で最も安い銘柄を選び、(2) 残りの予算でスコアの高い順に追加し、
          (3) 1つの月に入れる銘柄は最大2つまで、という手順で組み合わせを作っています。詳しい計算は<Link href="/method#calendar" className="text-primary underline">算出方法</Link>にあります。
          組み合わせは条件に合う一例であり、特定の銘柄の購入を勧めるものではありません。
        </P>
      </Section>
    </GuideArticle>
  );
}
