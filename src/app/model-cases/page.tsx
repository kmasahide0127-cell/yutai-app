import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { DATA_LAST_UPDATED } from "@/lib/yutai-data";
import { MODEL_CASES, runModelCase } from "@/lib/model-cases";
import { buildPageMetadata } from "@/lib/seo";

// 下書き段階のページ。説明文は運営者が書くため、公開前は noindex・ナビ未リンク・sitemap 非掲載にしている。
// 説明文の下書きは `node --import ./scripts/ts-alias-register.mjs scripts/generate-model-cases-draft.mts`
// で docs/model-cases-draft.md に出力する。
export const metadata = buildPageMetadata({
  title: "組み合わせ例(参考)",
  description: "代表的な生活パターンについて、診断ロジックで組み立てた優待カレンダーの組み合わせ例(参考)。",
  path: "/model-cases",
  noindex: true,
});

function formatYen(v: number): string {
  return `${v.toLocaleString()}円`;
}
function formatMonths(ms: number[]): string {
  return ms.length > 0 ? ms.map((m) => `${m}月`).join("・") : "なし";
}

export default function ModelCasesPage() {
  const results = MODEL_CASES.map((c) => runModelCase(c));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-2xl min-w-0 space-y-8 px-4 py-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">組み合わせ例(参考)</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            代表的な生活パターンを入力したときに、診断と同じ計算で組み立てた優待カレンダーの例です。
            データ基準日 {DATA_LAST_UPDATED} 時点の掲載データから自動で算出しています。
            条件に合う一例であり、特定の銘柄の購入を勧めるものではありません。
          </p>
        </header>

        {results.map((r) => (
          <section key={r.input.id} className="space-y-3 rounded-xl border border-border bg-card p-4" aria-labelledby={r.input.id}>
            <h2 id={r.input.id} className="text-base font-bold">{r.input.label}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-muted-foreground">出費カテゴリ</dt>
              <dd>{r.input.expenseCategories.join("・")}</dd>
              <dt className="text-muted-foreground">今年の予算</dt>
              <dd className="tabular-nums">{formatYen(r.input.budget)}</dd>
              <dt className="text-muted-foreground">世帯人数</dt>
              <dd>{r.input.householdSize}人</dd>
              <dt className="text-muted-foreground">候補銘柄数</dt>
              <dd className="tabular-nums">{r.candidateCount}銘柄</dd>
            </dl>

            <ul className="space-y-1.5">
              {r.picks.map(({ yutai, months }) => (
                <li key={yutai.code} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                  <Link href={`/stocks/${yutai.code}`} className="min-w-0 truncate font-medium underline">
                    {yutai.name}({yutai.code})
                  </Link>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatMonths(months)} / 年{formatYen(yutai.annualValue)} / {formatYen(yutai.approxInvestment)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <p>カバー月: {formatMonths(r.coveredMonths)}({r.coveredMonths.length}ヶ月)</p>
              <p>空く月: {formatMonths(r.emptyMonths)}</p>
              <p className="tabular-nums">必要投資額の合計: {formatYen(r.totalInvestment)}</p>
              <p className="tabular-nums">年間優待価値の合計: {formatYen(r.totalAnnualValue)}({r.yieldPercent}%)</p>
            </div>
          </section>
        ))}

        <p className="text-xs text-muted-foreground">
          ※ 参考情報であり、投資勧誘ではありません。投資判断はご自身の責任でお願いします
          (<Link href="/terms" className="underline">利用規約</Link>)。計算方法は<Link href="/method#calendar" className="underline">算出方法</Link>をご覧ください。
        </p>
      </div>
    </div>
  );
}
