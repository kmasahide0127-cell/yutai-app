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
import { getAllBrands } from "@/lib/matching";
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

const SITUATIONS = [
  "固定費を抑えたい",
  "一人暮らし",
  "共働き",
  "子育て中",
  "車を持っている",
  "ペットを飼っている",
  "持ち家",
  "在宅勤務多め",
];

const INVESTMENT_OPTIONS: { label: string; value: string }[] = [
  { label: "10万円以下", value: "100000" },
  { label: "30万円以下", value: "300000" },
  { label: "50万円以下", value: "500000" },
  { label: "100万円以下", value: "1000000" },
  { label: "上限なし", value: "unlimited" },
];

// オンボーディングの選択値を YUTAI_LIST の lifestyleTags にマッピング
const INTEREST_TAG_MAP: Record<string, string[]> = {
  "ガジェット・テクノロジー": ["ネットショッピング派", "キャッシュレス派"],
  "旅行・お出かけ": ["国内旅行派", "旅行好き", "飛行機利用頻度高"],
  "ファッション": ["ファッション好き", "セレクトショップ派"],
  "食事・グルメ": ["外食月3回以上", "カフェ派", "コーヒー好き"],
  "エンタメ(映画・テーマパーク)": ["映画好き", "エンタメ好き", "テーマパーク好き"],
  "健康・スポーツ": ["スポーツ用品購入頻度高", "スポーツ好き", "美容・健康意識高"],
  "生活雑貨・日用品": ["ドラッグストア高頻度利用", "スーパー利用頻度高"],
  "子育て・ファミリー": ["子育て中", "ファミリー外食"],
};

const SITUATION_TAG_MAP: Record<string, string[]> = {
  "固定費を抑えたい": ["コスパ重視"],
  "一人暮らし": [],
  "共働き": [],
  "子育て中": ["子育て中", "ファミリー外食"],
  "車を持っている": ["車所有", "ガソリン給油頻度高"],
  "ペットを飼っている": [],
  "持ち家": [],
  "在宅勤務多め": ["在宅ワーク"],
};

function buildResultsUrl(
  brands: string[],
  interests: string[],
  lifestyleTags: string[],
  maxInvestment: number | null
): string {
  const yutaiTags = new Set<string>();
  for (const interest of interests) {
    for (const tag of INTEREST_TAG_MAP[interest] ?? []) yutaiTags.add(tag);
  }
  for (const situation of lifestyleTags) {
    for (const tag of SITUATION_TAG_MAP[situation] ?? []) yutaiTags.add(tag);
  }

  const params = new URLSearchParams();
  if (brands.length > 0) params.set("brands", brands.join(","));
  const tagsArr = Array.from(yutaiTags);
  if (tagsArr.length > 0) params.set("tags", tagsArr.join(","));
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
    lifestyleTags,
    brands,
    maxInvestment,
    setInterests,
    setLifestyleTags,
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
      ? buildResultsUrl(brands, interests, lifestyleTags, maxInvestment)
      : undefined;

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

          {/* Step 2: ライフスタイル */}
          {currentStep === 2 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">あなたの状況は?</h2>
                <p className="text-sm text-muted-foreground">複数選択可・任意</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SITUATIONS.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={lifestyleTags.includes(item)}
                      onCheckedChange={() => setLifestyleTags(toggle(lifestyleTags, item))}
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Step 3: ブランド */}
          {currentStep === 3 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">よく使うサービス・お店は?</h2>
                <p className="text-sm text-muted-foreground">複数選択可・任意</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_BRANDS.map((brand) => (
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
                    <CardTitle>ライフスタイル</CardTitle>
                    <button
                      onClick={() => router.push("/onboarding?step=2")}
                      className="text-xs text-accent hover:underline"
                    >
                      修正
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {lifestyleTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {lifestyleTags.map((t) => (
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
