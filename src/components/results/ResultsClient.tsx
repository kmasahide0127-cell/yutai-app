"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShareSection } from "./ShareSection";
import {
  buildBudgetPackage,
  simulateFamilyShare,
  type CategoryGroup,
  type CalendarPackage,
  type BudgetPackage,
  type UserExpenseLifestyle,
} from "@/lib/matching";
import type { VehicleType } from "@/store/onboarding-store";
import type { Yutai } from "@/lib/yutai-data";

function formatYen(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}

function FamilyShareBox({ yutai, householdSize }: { yutai: Yutai; householdSize: number }) {
  const sim = simulateFamilyShare(yutai, householdSize);
  if (sim.type === "individual") {
    return (
      <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5">
        <p className="text-xs font-medium text-primary">👥 家族分散シミュレーション</p>
        <p className="text-xs text-muted-foreground mt-1">
          {householdSize}名義で取得すると年間{formatYen(sim.totalAnnualValue)}分の優待に
        </p>
        <p className="text-xs text-muted-foreground">
          ※必要投資額: 合計{formatYen(sim.totalInvestment)}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-muted/50 border border-border p-2.5">
      <p className="text-xs font-medium text-foreground">🏠 世帯共有型</p>
      <p className="text-xs text-muted-foreground mt-1">
        1名義で家族{householdSize}人がこの優待を使えます
      </p>
    </div>
  );
}

const CAR_EXPENSE_CATEGORY = "車関連費(ガソリン・駐車場・整備)";

type Props = {
  groupedResults: CategoryGroup[];
  expenseCategoryCount: number;
  calendarPackage: CalendarPackage;
  initialBudgetPackage: BudgetPackage;
  budgetCandidates: Yutai[];
  lifestyle: UserExpenseLifestyle;
  householdSize: number;
  vehicleType: VehicleType;
};

export function ResultsClient({
  groupedResults,
  expenseCategoryCount,
  calendarPackage,
  initialBudgetPackage,
  budgetCandidates,
  lifestyle,
  householdSize,
  vehicleType,
}: Props) {
  const perCategoryLimit = useMemo(() => {
    if (expenseCategoryCount <= 1) return 8;
    if (expenseCategoryCount === 2) return 5;
    if (expenseCategoryCount === 3) return 4;
    if (expenseCategoryCount <= 5) return 3;
    return 2;
  }, [expenseCategoryCount]);

  const hasAnyResults = groupedResults.some((g) => g.results.length > 0);

  // サマリー: 同銘柄が複数カテゴリに出てもダブルカウントしない
  const { totalSavings, totalInvestment, totalUnique } = useMemo(() => {
    const seen = new Set<string>();
    let savings = 0;
    let investment = 0;
    for (const { results } of groupedResults) {
      for (const r of results.slice(0, perCategoryLimit)) {
        if (!seen.has(r.yutai.id)) {
          seen.add(r.yutai.id);
          savings += r.annualSavings;
          investment += r.yutai.approxInvestment;
        }
      }
    }
    return { totalSavings: savings, totalInvestment: investment, totalUnique: seen.size };
  }, [groupedResults, perCategoryLimit]);

  const calendarYield =
    calendarPackage.totalInvestment > 0
      ? ((calendarPackage.totalAnnualValue / calendarPackage.totalInvestment) * 100).toFixed(1)
      : "0.0";

  const [budget, setBudget] = useState(initialBudgetPackage.budget);
  const budgetPackage = useMemo(() => {
    if (budget === initialBudgetPackage.budget) return initialBudgetPackage;
    return buildBudgetPackage(lifestyle, budgetCandidates, budget);
  }, [budget, initialBudgetPackage, lifestyle, budgetCandidates]);
  const budgetYield =
    budgetPackage.totalInvestment > 0
      ? ((budgetPackage.totalAnnualValue / budgetPackage.totalInvestment) * 100).toFixed(1)
      : "0.0";

  const shareText = (() => {
    const lines: string[] = [];
    lines.push("🎁 優待アプリで見つけた私の優待ポートフォリオ");
    lines.push("");
    if (calendarPackage.selectedYutai.length > 0) {
      lines.push(`📅 年間優待カレンダー (${calendarPackage.selectedYutai.length}銘柄)`);
      lines.push(`年間優待価値: ${formatYen(calendarPackage.totalAnnualValue)}`);
      lines.push(`必要投資額: ${formatYen(calendarPackage.totalInvestment)}`);
      lines.push(`利回り: ${calendarYield}%`);
      lines.push("");
    }
    if (budgetPackage.selectedYutai.length > 0) {
      lines.push(`💰 予算${formatYen(budget)}でのおすすめパッケージ`);
      lines.push(`年間優待価値: ${formatYen(budgetPackage.totalAnnualValue)}`);
      lines.push(`使用額: ${formatYen(budgetPackage.totalInvestment)}`);
      lines.push(`利回り: ${budgetYield}%`);
      lines.push("");
      lines.push("選ばれた銘柄:");
      budgetPackage.selectedYutai.forEach((s, idx) => {
        lines.push(`${idx + 1}. ${s.yutai.name}(${s.yutai.code}) - 年${formatYen(s.annualSavings)}`);
      });
      lines.push("");
    }
    lines.push("あなたも生活スタイルから優待を見つけませんか?");
    lines.push("https://yutai-app-lyart.vercel.app");
    return lines.join("\n");
  })();

  const shareTextShort = (() => {
    if (calendarPackage.selectedYutai.length > 0) {
      return `🎁 優待アプリで年間${formatYen(calendarPackage.totalAnnualValue)}削減見込みの優待ポートフォリオを見つけました!\n生活スタイルから優待が見つかるアプリです。`;
    }
    if (budgetPackage.selectedYutai.length > 0) {
      return `🎁 優待アプリで予算${formatYen(budget)}・利回り${budgetYield}%のおすすめパッケージを発見!\n生活スタイルから優待が見つかるアプリです。`;
    }
    return "🎁 優待アプリで自分にぴったりの株主優待を見つけました!";
  })();

  const shareUrl = "https://yutai-app-lyart.vercel.app";

  return (
    <div className="space-y-8 min-w-0">
      {/* ── 年間優待カレンダーパッケージ ── */}
      {calendarPackage.selectedYutai.length > 0 && (
        <section className="rounded-xl border-2 border-primary bg-primary/5 p-4">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              📅 年間優待カレンダー
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              権利確定月が分散するように選んだ {calendarPackage.selectedYutai.length} 銘柄。
              年間を通じて優待が届くパッケージです。
            </p>
            {calendarPackage.selectedYutai.length <= 3 && (
              <p className="mt-2 text-xs text-accent font-medium">
                💡 もっとカテゴリを選ぶと年間カレンダーが充実します
              </p>
            )}
          </div>

          {/* パッケージサマリー */}
          <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg bg-background p-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">必要投資額</p>
              <p className="text-base font-bold tabular-nums">{formatYen(calendarPackage.totalInvestment)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">年間優待価値</p>
              <p className="text-base font-bold text-primary tabular-nums">{formatYen(calendarPackage.totalAnnualValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">合計利回り</p>
              <p className="text-base font-bold tabular-nums">{calendarYield}%</p>
            </div>
          </div>

          {/* 月別カレンダー */}
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
              const entries = calendarPackage.monthEntries.filter((e) => e.month === month);
              const isEmpty = entries.length === 0;

              return (
                <div
                  key={month}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-2",
                    isEmpty ? "bg-muted/30" : "bg-background"
                  )}
                >
                  <div className="w-8 shrink-0 text-center">
                    <p className={cn("text-sm font-medium", isEmpty && "text-muted-foreground")}>
                      {month}月
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEmpty ? (
                      <p className="text-xs italic text-muted-foreground">権利確定なし</p>
                    ) : (
                      <div className="space-y-0.5">
                        {entries.map((entry, idx) => (
                          <div
                            key={`${entry.yutai.id}-${idx}`}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="truncate font-medium">
                              {entry.yutai.name}
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({entry.yutai.code})
                              </span>
                            </span>
                            <span className="shrink-0 font-semibold text-primary tabular-nums">
                              {formatYen(Math.round(entry.annualValue))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            ※ 権利確定月は2026年5月27日時点の情報。実際の優待発送は各企業の方針により異なります。
          </p>
        </section>
      )}

      {/* ── 予算別おすすめパッケージ ── */}
      {budgetCandidates.length > 0 && (
        <section className="rounded-xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              💰 予算別おすすめパッケージ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              投資予算を動かして、コスパ最大の組み合わせをシミュレーション
            </p>
          </div>

          {/* スライダー */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">投資予算</span>
              <span className="text-lg font-bold tabular-nums">{formatYen(budget)}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={3000000}
              step={50000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>10万円</span>
              <span>300万円</span>
            </div>
          </div>

          {/* パッケージサマリー */}
          <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg bg-background p-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">使用額</p>
              <p className="text-base font-bold tabular-nums">{formatYen(budgetPackage.totalInvestment)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">年間優待価値</p>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {formatYen(budgetPackage.totalAnnualValue)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">優待利回り</p>
              <p className="text-base font-bold tabular-nums">{budgetYield}%</p>
            </div>
          </div>

          {/* 銘柄リスト */}
          {budgetPackage.selectedYutai.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              この予算に合う銘柄がありません。予算を増やしてみてください。
            </p>
          ) : (
            <ul className="space-y-2">
              {budgetPackage.selectedYutai.map(({ yutai, annualSavings }, idx) => (
                <li
                  key={yutai.id}
                  className="flex items-center gap-3 rounded-lg bg-background px-3 py-2"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {yutai.name}
                      <span className="ml-1 text-xs text-muted-foreground">({yutai.code})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      投資額 {formatYen(yutai.approxInvestment)} · 利回り {yutai.yieldPercent}%
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatYen(Math.round(annualSavings))}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {budgetPackage.unusedBudget > 0 && budgetPackage.selectedYutai.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground text-right">
              残り予算: {formatYen(budgetPackage.unusedBudget)}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            ※ コスパ(優待価値÷投資額)が高い順に予算内で最大10銘柄を選択。投資判断はご自身でご確認ください。
          </p>
        </section>
      )}

      {/* ── カテゴリ別サマリー ── */}
      {hasAnyResults && (
        <div className="space-y-2 rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            厳選{totalUnique}銘柄で削減できる見込み額
          </p>
          <p className="text-3xl font-bold text-primary tabular-nums">
            年間 {formatYen(totalSavings)}
          </p>
          <p className="text-xs text-muted-foreground">
            必要投資額の合計: 約{Math.round(totalInvestment / 10000)}万円
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            優待情報の取得日: 2026年5月27日 | 全銘柄共通
          </p>
        </div>
      )}

      {/* ── 全カテゴリ該当なし ── */}
      {!hasAnyResults && calendarPackage.selectedYutai.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            選んだ出費カテゴリに該当する優待銘柄が見つかりませんでした。他のカテゴリも試してみてください。
          </p>
        </div>
      )}

      {/* ── カテゴリ別セクション ── */}
      {groupedResults.map(({ category, results }) => {
        const isCarCategory = category === CAR_EXPENSE_CATEGORY;
        const isEvUser = vehicleType === "ev";

        // EV車セクションは results=0 でも空状態ボックス表示のため素通りさせる
        if (results.length === 0 && !(isEvUser && isCarCategory)) return null;

        const topResults = results.slice(0, perCategoryLimit);
        const sectionTotal = topResults.reduce((sum, r) => sum + r.annualSavings, 0);

        return (
          <section key={category}>
            <div className="mb-4 border-b-2 border-primary pb-2">
              <h2 className="text-lg font-bold">{category}</h2>
              {topResults.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  上位{topResults.length}銘柄で年間 {formatYen(sectionTotal)} 削減見込み
                </p>
              )}
            </div>

            {/* EV向け正直な空状態 */}
            {isEvUser && isCarCategory && (
              <div className="mb-4 rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">🔌</span>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold">EVの充電費を下げる株主優待は、現状ありません</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      EV・PHVの充電費を直接下げる株主優待を、2026年5月時点で調査しましたが、見つかりませんでした。
                      石油元売り(ENEOS・出光等)の優待はガソリン給油の割引で、EVには使えません。
                      電力会社や充電サービス事業者の株主優待も確認しましたが、充電費が安くなる銘柄はありませんでした。
                    </p>
                    <div className="rounded-lg bg-background/60 p-2.5 text-xs leading-relaxed">
                      <p className="font-medium mb-1">💡 EV充電費を下げるには</p>
                      <p className="text-muted-foreground">
                        充電費の削減は「株主優待」ではなく「電気料金プラン」の領域です。
                        自宅充電なら、深夜帯が割安になるEV向け電力プラン(各電力会社が提供)の見直しが効果的です。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EVでも使える車関連優待の見出し */}
            {isEvUser && isCarCategory && topResults.length > 0 && (
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                EVでも使える車関連の優待
              </p>
            )}
            {isEvUser && isCarCategory && topResults.length === 0 && (
              <p className="rounded-lg border border-border bg-card p-3 text-center text-sm text-muted-foreground">
                現在、EVでも使える車関連の優待は準備中です
              </p>
            )}

            <ul className="space-y-3" aria-label={`${category}の優待銘柄`}>
              {topResults.map(({ yutai, matchReason, annualSavings }, idx) => (
                <li key={yutai.id}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg leading-snug">{yutai.name}</CardTitle>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            証券コード {yutai.code}
                            {" · "}
                            {yutai.dataQuality === "verified" ? (
                              <span className="text-green-600 dark:text-green-400">
                                ✓ 検証済み({yutai.lastVerified.replace(/-/g, "/").slice(2)}時点)
                              </span>
                            ) : (
                              <span>⚠ 参考情報</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-primary/10 px-4 py-4 text-center">
                        <p className="text-xs text-muted-foreground">年間出費削減見込み</p>
                        <p className="text-3xl font-bold text-primary tabular-nums">
                          {formatYen(annualSavings)}
                        </p>
                      </div>

                      {householdSize >= 2 && (
                        <FamilyShareBox yutai={yutai} householdSize={householdSize} />
                      )}

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">必要投資額</p>
                          <p className="font-semibold tabular-nums">{formatYen(yutai.approxInvestment)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">優待利回り</p>
                          <p className="font-semibold tabular-nums">{yutai.yieldPercent}%</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{matchReason}</p>
                      <p className="text-sm">{yutai.description}</p>

                      <div className="flex justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                        <span>権利確定: {yutai.rightsMonths.map((m) => `${m}月`).join("・")}</span>
                        <span>取得日: {yutai.lastVerified}</span>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>

            {householdSize >= 2 && (
              <p className="mt-3 text-xs text-muted-foreground">
                ※家族分散は各自の投資判断と合意のもとで行ってください。優待の利用可否は各企業の規約をご確認ください。
              </p>
            )}
          </section>
        );
      })}

      {/* ── シェア・コピーボタン ── */}
      {(calendarPackage.selectedYutai.length > 0 || budgetPackage.selectedYutai.length > 0) && (
        <ShareSection
          shareText={shareText}
          shareTextShort={shareTextShort}
          shareUrl={shareUrl}
        />
      )}

      <div className="pb-4">
        <Link
          href="/onboarding"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
        >
          条件を変える
        </Link>
      </div>

      <footer className="mb-6 text-center text-xs text-muted-foreground">
        <div className="space-x-4">
          <Link href="/terms" className="hover:underline">利用規約</Link>
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <a
            href="https://github.com/kmasahide0127-cell/yutai-app/issues"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            お問い合わせ
          </a>
        </div>
        <p className="mt-2">© 2026 優待アプリ(ベータ版) | データ取得日: 2026年5月27日</p>
      </footer>
    </div>
  );
}
