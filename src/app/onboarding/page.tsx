"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { useOnboardingStore } from "@/store/onboarding-store";
import { EXPENSE_CATEGORIES } from "@/lib/matching";
import { cn } from "@/lib/utils";

const HOUSEHOLD_OPTIONS: { label: string; value: number }[] = [
  { label: "1人(単身)", value: 1 },
  { label: "2人", value: 2 },
  { label: "3人", value: 3 },
  { label: "4人以上", value: 4 },
];

const INVESTMENT_OPTIONS: { label: string; value: string }[] = [
  { label: "10万円以下", value: "100000" },
  { label: "30万円以下", value: "300000" },
  { label: "50万円以下", value: "500000" },
  { label: "100万円以下", value: "1000000" },
  { label: "上限なし", value: "unlimited" },
];

function buildResultsUrl(
  expenseCategories: string[],
  maxInvestment: number | null,
  householdSize: number
): string {
  const params = new URLSearchParams();
  if (expenseCategories.length > 0) params.set("expenses", expenseCategories.join(","));
  if (maxInvestment !== null) params.set("maxInvestment", String(maxInvestment));
  if (householdSize > 1) params.set("household", String(householdSize));
  return `/results?${params.toString()}`;
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

const HOUSEHOLD_LABELS: Record<number, string> = {
  1: "1人(単身)",
  2: "2人",
  3: "3人",
  4: "4人以上",
};

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentStep = Math.max(1, Math.min(4, parseInt(searchParams.get("step") ?? "1", 10)));

  const {
    expenseCategories,
    householdSize,
    maxInvestment,
    setExpenseCategories,
    setHouseholdSize,
    setMaxInvestment,
  } = useOnboardingStore();

  const investmentStr = maxInvestment === null ? "unlimited" : String(maxInvestment);

  const handleInvestmentChange = (val: string) => {
    setMaxInvestment(val === "unlimited" ? null : parseInt(val, 10));
  };

  const resultsHref =
    currentStep === 4
      ? buildResultsUrl(expenseCategories, maxInvestment, householdSize)
      : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProgressBar currentStep={currentStep} />

      <div className="px-4 py-8 pb-32">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* Step 1: 出費カテゴリ */}
          {currentStep === 1 && (
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

          {/* Step 2: 世帯人数 */}
          {currentStep === 2 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">あなたの世帯は何人ですか?</h2>
                <p className="text-sm text-muted-foreground">
                  ご家族の人数によって、優待を最大限活用する方法が変わります(後で家族分散の試算に使います)
                </p>
              </div>
              <RadioGroup
                value={String(householdSize)}
                onValueChange={(val) => setHouseholdSize(parseInt(val, 10))}
              >
                {HOUSEHOLD_OPTIONS.map(({ label, value }) => (
                  <div
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-4 transition-colors",
                      householdSize === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => setHouseholdSize(value)}
                  >
                    <RadioGroupItem
                      value={String(value)}
                      className="pointer-events-none"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </RadioGroup>
            </section>
          )}

          {/* Step 3: 投資額 */}
          {currentStep === 3 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">投資可能な金額は?</h2>
                <p className="text-sm text-muted-foreground">1つ選択してください</p>
              </div>
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

          {/* Step 4: 確認 */}
          {currentStep === 4 && (
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
                    <CardTitle>主な出費</CardTitle>
                    <button
                      onClick={() => router.push("/onboarding?step=1")}
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
                    <CardTitle>世帯人数</CardTitle>
                    <button
                      onClick={() => router.push("/onboarding?step=2")}
                      className="text-xs text-accent hover:underline"
                    >
                      修正
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    {HOUSEHOLD_LABELS[householdSize] ?? `${householdSize}人`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>投資可能額</CardTitle>
                    <button
                      onClick={() => router.push("/onboarding?step=3")}
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
        isNextDisabled={false}
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
