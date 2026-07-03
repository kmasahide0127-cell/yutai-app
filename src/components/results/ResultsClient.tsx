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
import { HoldingsInput } from "./HoldingsInput";
import AffiliateBanner from "@/components/AffiliateBanner";
import {
  buildBudgetAwareCalendarPackage,
  simulateFamilyShare,
  inferPreferenceTags,
  PREFERENCE_TAGS,
  type CategoryGroup,
  type ExpenseCategory,
  type PreferenceTag,
} from "@/lib/matching";
import type { VehicleType } from "@/store/onboarding-store";
import type { Yutai } from "@/lib/yutai-data";

const ALL_PREFERENCE_TAGS_FLAT = Object.values(PREFERENCE_TAGS).flat();

function findTagInfo(tagId: PreferenceTag) {
  return ALL_PREFERENCE_TAGS_FLAT.find((t) => t.id === tagId);
}

function formatYen(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}

function formatInvestmentLabel(amount: number): string {
  const man = Math.round(amount / 10000);
  return `${man.toLocaleString()}万円`;
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
  budgetCandidates: Yutai[];
  investmentLimit: number;
  householdSize: number;
  vehicleType: VehicleType;
  preferenceTags: PreferenceTag[];
  preferenceTagCounts: Partial<Record<PreferenceTag, number>>;
  shareUrl: string;
};

export function ResultsClient({
  groupedResults,
  expenseCategoryCount,
  budgetCandidates,
  investmentLimit,
  householdSize,
  vehicleType,
  preferenceTags,
  preferenceTagCounts,
  shareUrl,
}: Props) {
  const perCategoryLimit = useMemo(() => {
    if (expenseCategoryCount <= 1) return 8;
    if (expenseCategoryCount === 2) return 5;
    if (expenseCategoryCount === 3) return 4;
    if (expenseCategoryCount <= 5) return 3;
    return 2;
  }, [expenseCategoryCount]);

  const hasAnyResults = groupedResults.some((g) => g.results.length > 0);

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

  // 予算スライダー。初期値はオンボーディングの investmentLimit
  const [budget, setBudget] = useState(investmentLimit);

  // 保有株
  const [heldYutai, setHeldYutai] = useState<Yutai[]>([]);

  // 月 → 保有済み銘柄のマップ
  const heldCalendarEntries = useMemo(() => {
    const map = new Map<number, Yutai[]>();
    for (const y of heldYutai) {
      for (const m of y.rightsMonths) {
        if (!map.has(m)) map.set(m, []);
        map.get(m)!.push(y);
      }
    }
    return map;
  }, [heldYutai]);

  const toggleHeld = (yutai: Yutai) => {
    setHeldYutai((prev) => {
      const isHeld = prev.some((h) => h.code === yutai.code);
      return isHeld ? prev.filter((h) => h.code !== yutai.code) : [...prev, yutai];
    });
  };

  // 予算・保有株変更のたびにカレンダーを再計算(confirmed累積制約 + ghost候補)
  const cal = useMemo(
    () => buildBudgetAwareCalendarPackage(budgetCandidates, budget, preferenceTags, heldYutai.map((y) => y.code)),
    [budgetCandidates, budget, preferenceTags, heldYutai]
  );

  const calendarYield = cal.confirmedYield.toFixed(1);

  // 保有株の権利月も含めた実際のカバー月数
  const coveredMonthCount = useMemo(() => {
    const months = new Set<number>(cal.confirmed.map((e) => e.month));
    for (const m of heldCalendarEntries.keys()) months.add(m);
    return months.size;
  }, [cal.confirmed, heldCalendarEntries]);

  // 保有株だけがカバーする月数(内訳表示用)
  const heldOnlyMonthCount = useMemo(() => {
    const confirmedMonths = new Set<number>(cal.confirmed.map((e) => e.month));
    let count = 0;
    for (const m of heldCalendarEntries.keys()) {
      if (!confirmedMonths.has(m)) count++;
    }
    return count;
  }, [cal.confirmed, heldCalendarEntries]);

  const shareText = (() => {
    const lines: string[] = [];
    lines.push("🎁 生活から株主優待を逆引きして、私の「年間優待カレンダー」を作ってみました");
    lines.push("");
    if (cal.confirmedYutaiCount > 0) {
      lines.push("📅 私の診断結果");
      lines.push(`・${cal.confirmedYutaiCount}銘柄 / ${coveredMonthCount}ヶ月カバー`);
      lines.push(`・優待利回り: ${calendarYield}%`);
      lines.push("");
    }
    lines.push("食費・外食・交通など毎月の出費を入力するだけで、");
    lines.push("自分の生活にぴったりの優待が見つかります。");
    lines.push("投資の判断はご自身でどうぞ。");
    lines.push("");
    lines.push("👉 同じ診断をしてみる");
    lines.push(shareUrl);
    return lines.join("\n");
  })();

  const shareTextShort = cal.confirmedYutaiCount > 0
    ? `🎁 生活費から株主優待を逆引きする診断を試してみました！\n私の優待カレンダー: ${cal.confirmedYutaiCount}銘柄・${coveredMonthCount}ヶ月カバー\nあなたも診断してみませんか？`
    : "🎁 生活から株主優待を逆引きするツールで診断してみました！";

  return (
    <div className="space-y-8 min-w-0">
      {/* ── 年間優待カレンダー + 予算スライダー(統合) ── */}
      {budgetCandidates.length > 0 && (
        <section className="rounded-xl border-2 border-primary bg-primary/5 p-4">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              📅 年間優待カレンダー
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              投資予算内で権利確定月が分散するパッケージを自動構成します
            </p>
          </div>

          {/* 予算スライダー */}
          <div className="mb-4 rounded-lg bg-background p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">予算</span>
              <span className="text-lg font-bold tabular-nums">{formatInvestmentLabel(budget)}</span>
            </div>
            <input
              type="range"
              min={100000}
              max={10000000}
              step={100000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>10万円</span>
              <span>1,000万円</span>
            </div>
          </div>

          {/* 保有済み銘柄 */}
          <div className="mb-4 rounded-lg bg-background p-3">
            <HoldingsInput heldYutai={heldYutai} onChange={setHeldYutai} />
          </div>

          {/* パッケージサマリー */}
          {cal.confirmedYutaiCount > 0 ? (
            <>
              <div className="mb-3 grid grid-cols-4 gap-2 rounded-lg bg-background p-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {heldYutai.length > 0 ? "必要投資額(保有分を除く)" : "必要投資額"}
                  </p>
                  <p className="text-sm font-bold tabular-nums">{formatYen(cal.confirmedTotalInvestment)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">年間優待価値</p>
                  <p className="text-sm font-bold text-primary tabular-nums">{formatYen(cal.confirmedAnnualValue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">合計利回り</p>
                  <p className="text-sm font-bold tabular-nums">{calendarYield}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">カバー月数</p>
                  <p className="text-sm font-bold tabular-nums">
                    <span className={coveredMonthCount < 6 ? "text-muted-foreground" : "text-primary"}>
                      {coveredMonthCount}
                    </span>
                    <span className="text-xs text-muted-foreground">/12ヶ月</span>
                  </p>
                  {heldOnlyMonthCount > 0 && (
                    <p className="text-[10px] text-muted-foreground/70">うち保有{heldOnlyMonthCount}ヶ月</p>
                  )}
                </div>
              </div>

              {/* 来年度候補サマリー(ghostがあれば) */}
              {cal.ghost.length > 0 && (
                <p className="mb-3 text-xs text-muted-foreground">
                  💡 来年度の追加候補: 合計{formatYen(cal.ghostTotalInvestment)}（年間{formatYen(cal.ghostAnnualValue)}相当）
                </p>
              )}

              {cal.confirmedYutaiCount <= 3 && (
                <p className="mb-3 text-xs text-accent font-medium">
                  💡 もっとカテゴリを選ぶか予算を増やすと年間カレンダーが充実します
                </p>
              )}
            </>
          ) : (
            <div className="mb-4 rounded-lg bg-background p-4 text-center">
              <p className="text-sm text-muted-foreground">
                予算 {formatInvestmentLabel(budget)} では確定できる優待がありません
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                スライダーを右に動かして予算を増やしてみてください
              </p>
            </div>
          )}

          {/* 月別カレンダー */}
          <p className="mb-2 text-xs text-muted-foreground/70">
            すでに持っている銘柄にチェックを入れると、提案から外して「保有済み」として扱います
          </p>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
              const confirmedEntries = cal.confirmed.filter((e) => e.month === month);
              const ghostEntries = cal.ghost.filter((e) => e.month === month);
              const heldForMonth = heldCalendarEntries.get(month) ?? [];
              const hasConfirmed = confirmedEntries.length > 0;
              const hasGhost = ghostEntries.length > 0;
              const isHeldCovered = heldForMonth.length > 0;
              const isEmpty = !hasConfirmed && !hasGhost && !isHeldCovered;

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
                      <p className="text-xs italic text-muted-foreground">
                        この月の優待は予算内では現状ありません
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {/* 保有済み銘柄 */}
                        {isHeldCovered && (
                          <div className="space-y-0.5">
                            {heldForMonth.map((y) => (
                              <div
                                key={`h-${y.code}`}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked
                                  onChange={() => toggleHeld(y)}
                                  className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-stone-600"
                                  aria-label={`${y.name}の保有設定を解除`}
                                />
                                <span className="truncate text-sm text-muted-foreground flex-1">
                                  {y.name}
                                  <span className="ml-1 text-xs text-muted-foreground/70">
                                    ({y.code})
                                  </span>
                                </span>
                                <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary/80">
                                  保有済み
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 確定銘柄 */}
                        {hasConfirmed && (
                          <div className="space-y-0.5">
                            {confirmedEntries.map((entry, idx) => (
                              <div
                                key={`c-${entry.yutai.id}-${idx}`}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={false}
                                  onChange={() => toggleHeld(entry.yutai)}
                                  className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-stone-600"
                                  aria-label={`${entry.yutai.name}を保有済みに設定`}
                                />
                                <span className="truncate font-medium flex-1">
                                  {entry.yutai.name}
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    ({entry.yutai.code})
                                  </span>
                                </span>
                                <span className="shrink-0 font-semibold text-primary tabular-nums">
                                  {formatYen(entry.yutai.annualValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ゴースト銘柄(確定がない月にのみ表示) */}
                        {!hasConfirmed && hasGhost && (
                          <div className="space-y-0.5">
                            {ghostEntries.map((entry, idx) => (
                              <div key={`g-${entry.yutai.id}-${idx}`} className="space-y-0">
                                <p className="text-[10px] text-muted-foreground/70">
                                  💡 来年度の追加候補
                                </p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={false}
                                    onChange={() => toggleHeld(entry.yutai)}
                                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-stone-600"
                                    aria-label={`${entry.yutai.name}を保有済みに設定`}
                                  />
                                  <span className="truncate text-xs text-muted-foreground/60 flex-1">
                                    {entry.yutai.name}
                                    <span className="ml-1 text-muted-foreground/50">
                                      ({entry.yutai.code})
                                    </span>
                                  </span>
                                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground/60">
                                    {formatYen(entry.yutai.approxInvestment)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            ※ 権利確定月は2026年5月27日時点の情報。権利確定後、実際に優待品が届くまでには通常2〜4ヶ月程度かかります(企業により異なります)。実際の優待発送は各企業の方針により異なりますので、詳細は各企業のIR情報をご確認ください。
          </p>
        </section>
      )}

      {/* ── アフィリエイトバナー ── */}
      {budgetCandidates.length > 0 && (
        <section className="space-y-2" aria-label="証券口座のご案内">
          <h2 className="text-base font-bold">証券口座をお持ちでない方へ</h2>
          <AffiliateBanner />
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
      {!hasAnyResults && budgetCandidates.length === 0 && (
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

        if (results.length === 0 && !(isEvUser && isCarCategory)) return null;

        const topResults = results.slice(0, perCategoryLimit);
        const sectionTotal = topResults.reduce((sum, r) => sum + r.annualSavings, 0);

        const categoryTagDefs = PREFERENCE_TAGS[category as ExpenseCategory] ?? [];
        const selectedTagsForCategory = categoryTagDefs.filter((t) =>
          preferenceTags.includes(t.id)
        );
        const limitedTagInfos = selectedTagsForCategory
          .map((t) => ({ tag: t, count: preferenceTagCounts[t.id] ?? 0 }))
          .filter(({ count }) => count > 0 && count <= 2);
        const emptyTagInfos = selectedTagsForCategory.filter(
          (t) => (preferenceTagCounts[t.id] ?? 0) === 0
        );

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

            {emptyTagInfos.length > 0 && (
              <div className="mb-4 rounded-xl border border-border bg-card p-4 space-y-1.5">
                <p className="text-sm font-medium">
                  {emptyTagInfos.map((t) => `${t.emoji} ${t.label}`).join("・")}関連の優待は現状ありません
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {emptyTagInfos.map((t) => t.label).join("・")}に特化した優待は、当アプリの収録範囲では現状確認できていません。
                  銘柄データが充実次第、追加予定です。関連する一般的な優待を下に提案します。
                </p>
              </div>
            )}

            {limitedTagInfos.length > 0 && (
              <div className="mb-4 rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-1.5">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  この嗜好に該当する優待は限定的です
                </p>
                <ul className="space-y-0.5">
                  {limitedTagInfos.map(({ tag, count }) => (
                    <li key={tag.id} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                      <span className="text-amber-600/70 dark:text-amber-500/70">({count}件)</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  関連する優待を提案しますが、お探しの分野は現状の銘柄数では選択肢が少ない状態です。
                </p>
              </div>
            )}

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
              {topResults.map(({ yutai, matchReason, annualSavings }, idx) => {
                const yutaiInferredTags = inferPreferenceTags(yutai);
                const matchedPreferenceTags = preferenceTags.filter((t) =>
                  yutaiInferredTags.includes(t)
                );

                return (
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
                            {matchedPreferenceTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {matchedPreferenceTags.map((tagId) => {
                                  const info = findTagInfo(tagId);
                                  return info ? (
                                    <span
                                      key={tagId}
                                      className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                                    >
                                      {info.emoji} {info.label}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
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
                );
              })}
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
      {cal.confirmedYutaiCount > 0 && (
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
          <Link href="/contact" className="hover:underline">お問い合わせ</Link>
          <Link href="/about" className="hover:underline">このサイトについて</Link>
        </div>
        <p className="mt-2">© 2026 優待アプリ | データ取得日: 2026年5月27日</p>
      </footer>
    </div>
  );
}
