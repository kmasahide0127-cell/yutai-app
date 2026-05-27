"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { useOnboardingStore } from "@/store/onboarding-store";
import {
  getAllBrands,
  getBrandRelevanceScore,
  groupBrandsByCategory,
  EXPENSE_CATEGORIES,
} from "@/lib/matching";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { cn } from "@/lib/utils";

const ALL_BRANDS = getAllBrands(YUTAI_LIST);

const INTERESTS = [
  "ガジェット・テクノロジー",
  "旅行・お出かけ",
  "ファッション",
  "食事・グルメ",
  "エンタメ(映画・テーマパーク)",
  "健康・スポーツ",
  "生活雑貨・日用品",
  "子育て・ファミリー",
];

const INVESTMENT_OPTIONS: { label: string; value: string }[] = [
  { label: "10万円以下", value: "100000" },
  { label: "30万円以下", value: "300000" },
  { label: "50万円以下", value: "500000" },
  { label: "100万円以下", value: "1000000" },
  { label: "上限なし", value: "unlimited" },
];

function buildResultsUrl(
  brands: string[],
  expenseCategories: string[],
  maxInvestment: number | null
): string {
  const params = new URLSearchParams();
  if (brands.length > 0) params.set("brands", brands.join(","));
  if (expenseCategories.length > 0) params.set("expenses", expenseCategories.join(","));
  if (maxInvestment !== null) params.set("maxInvestment", String(maxInvestment));
  return `/results?${params.toString()}`;
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentStep = Math.max(1, Math.min(5, parseInt(searchParams.get("step") ?? "1", 10)));

  const {
    interests,
    expenseCategories,
    brands,
    maxInvestment,
    setInterests,
    setExpenseCategories,
    setBrands,
    setMaxInvestment,
  } = useOnboardingStore();

  const investmentStr = maxInvestment === null ? "unlimited" : String(maxInvestment);

  const handleInvestmentChange = (val: string) => {
    setMaxInvestment(val === "unlimited" ? null : parseInt(val, 10));
  };

  const isNextDisabled = currentStep === 1 && interests.length === 0;

  const resultsHref =
    currentStep === 5
      ? buildResultsUrl(brands, expenseCategories, maxInvestment)
      : undefined;

  // Step3用: 興味ベースでブランドをスコアリングして2グループに分ける
  const brandScores = useMemo(() => {
    const scores: Record<string, number> = {};
    for (const brand of ALL_BRANDS) {
      scores[brand] = getBrandRelevanceScore(brand, interests, [], YUTAI_LIST);
    }
    return scores;
  }, [interests]);

  const recommendedBrands = useMemo(
    () =>
      ALL_BRANDS.filter((b) => brandScores[b] > 0).sort(
        (a, b) => brandScores[b] - brandScores[a]
      ),
    [brandScores]
  );

  const otherBrandsByCategory = useMemo(() => {
    const otherSet = new Set(ALL_BRANDS.filter((b) => brandScores[b] === 0));
    const allByCategory = groupBrandsByCategory(YUTAI_LIST);
    const result: Record<string, string[]> = {};
    for (const [cat, catBrands] of Object.entries(allByCategory)) {
      const filtered = catBrands.filter((b) => otherSet.has(b));
      if (filtered.length > 0) result[cat] = filtered;
    }
    return result;
  }, [brandScores]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProgressBar currentStep={currentStep} />

      <div className="px-4 py-8 pb-24">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* Step 1: 興味 */}
          {currentStep === 1 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">何に興味がありますか?</h2>
                <p className="text-sm text-muted-foreground">複数選択可・1つ以上必須</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {INTERESTS.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={interests.includes(item)}
                      onCheckedChange={() => setInterests(toggle(interests, item))}
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Step 2: 出費カテゴリ */}
          {currentStep === 2 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">あなたが毎月出費しているものは?</h2>
                <p className="text-sm text-muted-foreground">
                  該当する出費カテゴリを選んでください。優待でこの出費をカバーする銘柄を提案します。
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {EXPENSE_CATEGORIES.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={expenseCategories.includes(item)}
                      onCheckedChange={() =>
                        setExpenseCategories(toggle(expenseCategories, item))
                      }
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Step 3: ブランド */}
          {currentStep === 3 && (
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">よく使うサービス・お店は?</h2>
                <p className="text-sm text-muted-foreground">複数選択可・任意</p>
              </div>

              {/* スキップ推奨バナー */}
              <div className="flex items-center justify-between gap-4 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  ブランドを指定しなくても、出費カテゴリだけで提案できます
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setBrands([]);
                    router.push("/onboarding?step=4");
                  }}
                >
                  スキップ
                </Button>
              </div>

              {/* あなたへのおすすめ */}
              <div>
                <h3 className="text-lg font-semibold mb-1">あなたへのおすすめ</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  興味とライフスタイルから関連が高いブランドです
                </p>
                {recommendedBrands.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {recommendedBrands.map((brand) => (
                      <label
                        key={brand}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={brands.includes(brand)}
                          onCheckedChange={() => setBrands(toggle(brands, brand))}
                        />
                        <span className="text-sm leading-tight">{brand}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
                    該当するブランドがありません。下のカテゴリから選んでください
                  </p>
                )}
              </div>

              {/* その他のサービス */}
              <div>
                <h3 className="text-lg font-semibold mb-1">その他のサービス</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  カテゴリ別に他のブランドも探せます
                </p>
                {Object.entries(otherBrandsByCategory).map(([category, catBrands]) => (
                  <details
                    key={category}
                    className="mt-3 overflow-hidden rounded-lg border border-border"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-medium hover:bg-muted/50">
                      <span>{category}</span>
                      <span className="text-xs text-muted-foreground">{catBrands.length}件</span>
                    </summary>
                    <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
                      {catBrands.map((brand) => (
                        <label
                          key={brand}
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={brands.includes(brand)}
                            onCheckedChange={() => setBrands(toggle(brands, brand))}
                          />
                          <span className="text-sm leading-tight">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </details>
                ))}
              </div>

              {/* テキストリンクスキップ */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    setBrands([]);
                    router.push("/onboarding?step=4");
                  }}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  使うブランドはない / 出費カテゴリだけで提案して
                </button>
              </div>
            </section>
          )}

          {/* Step 4: 投資額 */}
          {currentStep === 4 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">投資可能な金額は?</h2>
                <p className="text-sm text-muted-foreground">1つ選択してください</p>
              </div>
              {/* RadioGroup で value 管理、行全体をクリック可能にするため RadioGroupItem は pointer-events-none */}
              <RadioGroup
                value={investmentStr}
                onValueChange={handleInvestmentChange}
              >
                {INVESTMENT_OPTIONS.map(({ label, value }) => (
                  <div
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-4 transition-colors",
                      investmentStr === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => handleInvestmentChange(value)}
                  >
                    <RadioGroupItem
                      value={value}
                      className="pointer-events-none"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </RadioGroup>
            </section>
          )}

          {/* Step 5: 確認 */}
          {currentStep === 5 && (
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">入力内容の確認</h2>
                <p className="text-sm text-muted-foreground">
                  内容を確認して「結果を見る」を押してください
                </p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>興味・関心</CardTitle>
                    <button
                      onClick={() => router.push("/onboarding?step=1")}
                      className="text-xs text-accent hover:underline"
                    >
                      修正
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((i) => (
                        <span
                          key={i}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">未選択</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>主な出費</CardTitle>
                    <button
                      onClick={() => router.push("/onboarding?step=2")}
                      className="text-xs text-accent hover:underline"
                    >
                      修正
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {expenseCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {expenseCategories.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">未選択</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>よく使うサービス</CardTitle>
                    <button
                      onClick={() => router.push("/onboarding?step=3")}
                      className="text-xs text-accent hover:underline"
                    >
                      修正
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {brands.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {brands.map((b) => (
                        <span
                          key={b}
                          className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">未選択</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>投資可能額</CardTitle>
                    <button
                      onClick={() => router.push("/onboarding?step=4")}
                      className="text-xs text-accent hover:underline"
                    >
                      修正
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    {maxInvestment === null
                      ? "上限なし"
                      : `${maxInvestment.toLocaleString("ja-JP")}円以下`}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>

      <NavigationButtons
        currentStep={currentStep}
        isNextDisabled={isNextDisabled}
        resultsHref={resultsHref}
      />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
