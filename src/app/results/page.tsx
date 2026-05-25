import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { matchYutai } from "@/lib/matching";
import { YUTAI_LIST } from "@/lib/yutai-data";

type SearchParams = Promise<{
  brands?: string;
  tags?: string;
  maxInvestment?: string;
}>;

function scoreLabel(score: number): { text: string; className: string } {
  if (score >= 70)
    return {
      text: `${score}点`,
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
  if (score >= 40)
    return {
      text: `${score}点`,
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
  return {
    text: `${score}点`,
    className: "bg-muted text-muted-foreground",
  };
}

function formatYen(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}

function formatRightsMonths(months: number[]): string {
  return months.map((m) => `${m}月`).join("・");
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { brands: brandsParam, tags: tagsParam, maxInvestment: maxParam } =
    await searchParams;

  const brands = brandsParam?.split(",").filter(Boolean) ?? [];
  const lifestyleTags = tagsParam?.split(",").filter(Boolean) ?? [];
  const maxInvestment = maxParam ? parseInt(maxParam, 10) : undefined;

  const results = matchYutai({ brands, lifestyleTags, maxInvestment }, YUTAI_LIST);

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">あなたの生活にマッチした優待</h1>
          {results.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {results.length}件がマッチしました
            </p>
          ) : null}
        </header>

        {results.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
            <p className="text-muted-foreground">
              該当する優待が見つかりませんでした。条件を変えて再検索してみてください。
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {results.map(({ yutai, score, matchReason }) => {
              const badge = scoreLabel(score);
              return (
                <li key={yutai.id}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle>{yutai.name}</CardTitle>
                          <CardDescription>証券コード {yutai.code}</CardDescription>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.text}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {matchReason}
                      </p>
                      <p className="text-sm">{yutai.description}</p>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-xs text-muted-foreground">年間優待価値</dt>
                          <dd className="font-medium">{formatYen(yutai.annualValue)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">必要投資額</dt>
                          <dd className="font-medium">{formatYen(yutai.approxInvestment)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">優待利回り</dt>
                          <dd className="font-medium">{yutai.yieldPercent}%</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">権利確定月</dt>
                          <dd className="font-medium">
                            {formatRightsMonths(yutai.rightsMonths)}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        <div className="pb-8">
          <Link
            href="/lifestyle"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full"
            )}
          >
            条件を変える
          </Link>
        </div>
      </div>
    </div>
  );
}
