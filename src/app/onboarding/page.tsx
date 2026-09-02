"use client";

import { Suspense, useState, useEffect } from "react";
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
import type { VehicleType } from "@/store/onboarding-store";
import {
  EXPENSE_CATEGORIES,
  PREFERENCE_TAGS,
  type ExpenseCategory,
  type PreferenceTag,
} from "@/lib/matching";
import { cn } from "@/lib/utils";

const CAR_CATEGORY = "車関連費(ガソリン・駐車場・整備)" as const;

const HOUSEHOLD_OPTIONS: { label: string; value: number }[] = [
  { label: "1人(単身)", value: 1 },
  { label: "2人", value: 2 },
  { label: "3人", value: 3 },
  { label: "4人以上", value: 4 },
];

const INVESTMENT_MAX_MAN_YEN = 100000; // 100,000万円 = 10億円

const VEHICLE_OPTIONS: { label: string; value: "gasoline" | "ev" }[] = [
  { label: "⛽ ガソリン車・ディーゼル車・ハイブリッド", value: "gasoline" },
  { label: "🔌 EV(電気自動車)・PHV", value: "ev" },
];

// Step 4 でタグ ID → ラベル変換に使う一覧
const ALL_PREFERENCE_TAGS_FLAT = Object.values(PREFERENCE_TAGS).flat();

function buildResultsUrl(
  expenseCategories: string[],
  maxInvestment: number | null,
  householdSize: number,
  vehicleType: VehicleType,
  preferenceTags: PreferenceTag[]
): string {
  const params = new URLSearchParams();
  if (expenseCategories.length > 0) params.set("expenses", expenseCategories.join(","));
  if (maxInvestment !== null) params.set("maxInvestment", String(maxInvestment));
  if (householdSize > 1) params.set("household", String(householdSize));
  if (vehicleType && expenseCategories.includes(CAR_CATEGORY)) {
    params.set("vehicleType", vehicleType);
  }
  if (preferenceTags.length > 0) params.set("preferenceTags", preferenceTags.join(","));
  return `/results?${params.toString()}`;
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function formatInvestmentLabel(amount: number): string {
  if (amount >= 100000000) {
    const oku = amount / 100000000;
    return `${oku % 1 === 0 ? oku : oku.toFixed(1)}億円`;
  }
  const man = amount / 10000;
  return `${man.toLocaleString()}万円`;
}

const HOUSEHOLD_LABELS: Record<number, string> = {
  1: "1人(単身)",
  2: "2人",
  3: "3人",
  4: "4人以上",
};

const VEHICLE_LABELS: Record<string, string> = {
  gasoline: "ガソリン車・HV",
  ev: "EV・PHV",
};

type TypePreset = {
  id: string;
  emoji: string;
  label: string;
  chips: string[];
  expenseCategories: ExpenseCategory[];
  preferenceTags: PreferenceTag[];
};

const TYPE_PRESETS: TypePreset[] = [
  {
    id: "family",
    emoji: "👨‍👩‍👧",
    label: "子育てファミリー型",
    chips: ["子育て", "ファミリー外食", "教育"],
    expenseCategories: ["子育て・教育", "外食・カフェ"],
    preferenceTags: ["family-restaurant"],
  },
  {
    id: "gourmet",
    emoji: "🍽️",
    label: "グルメ・お酒好き型",
    chips: ["外食", "居酒屋", "お酒"],
    expenseCategories: ["外食・カフェ", "自炊・食材"],
    preferenceTags: ["izakaya", "alcohol"],
  },
  {
    id: "otaku",
    emoji: "🎮",
    label: "推し活・インドア型",
    chips: ["ゲーム", "アニメ", "推し活", "動画配信"],
    expenseCategories: ["趣味・ガジェット", "エンタメ(映画・テーマパーク)"],
    preferenceTags: ["games", "anime", "oshi-katsu", "streaming"],
  },
  {
    id: "beauty",
    emoji: "✨",
    label: "美容意識高め型",
    chips: ["スキンケア", "メイク", "コスメ"],
    expenseCategories: ["美容・スキンケア"],
    preferenceTags: ["makeup", "skincare"],
  },
  {
    id: "fashion",
    emoji: "👗",
    label: "ファッション・オシャレ型",
    chips: ["ファッション", "ブランド", "百貨店"],
    expenseCategories: ["衣服・ファッション"],
    preferenceTags: ["casual-wear", "luxury-brand"],
  },
  {
    id: "travel",
    emoji: "✈️",
    label: "おでかけ・旅好き型",
    chips: ["旅行", "温泉", "ホテル"],
    expenseCategories: ["交通・旅行"],
    preferenceTags: ["domestic-flight", "hotel"],
  },
  {
    id: "car",
    emoji: "🚗",
    label: "クルマ・バイク型",
    chips: ["車所有", "ドライブ", "カー用品"],
    expenseCategories: ["車関連費(ガソリン・駐車場・整備)"],
    preferenceTags: [],
  },
  {
    id: "sports",
    emoji: "🏃",
    label: "健康・スポーツ型",
    chips: ["スポーツ", "アウトドア", "健康"],
    expenseCategories: ["健康・スポーツ"],
    preferenceTags: ["gym"],
  },
  {
    id: "savings",
    emoji: "💰",
    label: "節約・家計管理型",
    chips: ["日用品", "節約", "家計管理"],
    expenseCategories: ["日用品・ドラッグストア", "ネットショッピング"],
    preferenceTags: [],
  },
];

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentStep = Math.max(0, Math.min(4, parseInt(searchParams.get("step") ?? "0", 10)));

  const {
    expenseCategories,
    householdSize,
    maxInvestment,
    vehicleType,
    preferenceTags,
    setExpenseCategories,
    setHouseholdSize,
    setMaxInvestment,
    setVehicleType,
    setPreferenceTags,
    togglePreferenceTag,
  } = useOnboardingStore();

  // 投資額入力: 万円単位の文字列。store には円単位で保存。
  const [investmentInput, setInvestmentInput] = useState<string>(() =>
    maxInvestment !== null ? String(maxInvestment / 10000) : ""
  );

  // ステップ変化時にストアの値と同期(「戻る」で戻ってきた場合など)
  useEffect(() => {
    setInvestmentInput(maxInvestment !== null ? String(maxInvestment / 10000) : "");
  // currentStep が変わったタイミングのみ再同期。タイピング中は不要。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const parsedManYen = parseInt(investmentInput, 10);
  const isInvestmentOverLimit =
    investmentInput.length > 0 && !isNaN(parsedManYen) && parsedManYen > INVESTMENT_MAX_MAN_YEN;
  const isInvestmentValid =
    investmentInput.length > 0 &&
    !isNaN(parsedManYen) &&
    parsedManYen > 0 &&
    parsedManYen <= INVESTMENT_MAX_MAN_YEN;

  const handleInvestmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 半角数字のみ許可(全角は除去)
    const cleaned = e.target.value.replace(/[^0-9]/g, "");
    setInvestmentInput(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (cleaned.length > 0 && !isNaN(parsed) && parsed > 0 && parsed <= INVESTMENT_MAX_MAN_YEN) {
      setMaxInvestment(parsed * 10000);
    } else {
      setMaxInvestment(null);
    }
  };

  const handleExpenseCategoryChange = (item: string) => {
    const next = toggle(expenseCategories, item);
    setExpenseCategories(next);
    if (item === CAR_CATEGORY && !next.includes(item)) {
      setVehicleType(null);
    }
    // カテゴリを外した時は、そのカテゴリに属するタグも削除
    if (!next.includes(item)) {
      const removedTagIds = PREFERENCE_TAGS[item as ExpenseCategory]?.map((t) => t.id) ?? [];
      if (removedTagIds.length > 0) {
        setPreferenceTags(preferenceTags.filter((t) => !removedTagIds.includes(t)));
      }
    }
  };

  const resultsHref =
    currentStep === 4
      ? buildResultsUrl(expenseCategories, maxInvestment, householdSize, vehicleType, preferenceTags)
      : undefined;

  const hasCarCategory = expenseCategories.includes(CAR_CATEGORY);

  // タグが存在する選択済みカテゴリのみ抽出(表示順を保持)
  const categoriesWithTags = expenseCategories.filter(
    (cat) => (PREFERENCE_TAGS[cat as ExpenseCategory]?.length ?? 0) > 0
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentStep > 0 && <ProgressBar currentStep={currentStep} />}

      <div className={cn("px-4 py-8", currentStep > 0 ? "pb-32" : "pb-12")}>
        <div className="mx-auto max-w-2xl space-y-6">

          {/* Step 0: タイプ選択 */}
          {currentStep === 0 && (
            <section className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">あなたに近いタイプは?</h2>
                <p className="text-sm text-muted-foreground">
                  タイプを選ぶと、出費やお好みの設問がまとめて選択されます(あとで自由に調整できます)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TYPE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setExpenseCategories(preset.expenseCategories);
                      setPreferenceTags(preset.preferenceTags);
                      router.push("/onboarding?step=1");
                    }}
                    className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98]"
                  >
                    <span className="text-2xl">{preset.emoji}</span>
                    <span className="text-sm font-medium leading-tight">{preset.label}</span>
                    <div className="flex flex-wrap gap-1">
                      {preset.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => router.push("/onboarding?step=1")}
                className="w-full rounded-xl border border-border px-4 py-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                じぶんで選ぶ →
              </button>
            </section>
          )}

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
                      onCheckedChange={() => handleExpenseCategoryChange(item)}
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </label>
                ))}
              </div>

              {/* 嗜好タグ: タグが定義されたカテゴリを選択した場合に表示 */}
              {categoriesWithTags.length > 0 && (
                <div className="space-y-3">
                  {categoriesWithTags.map((cat) => {
                    const tags = PREFERENCE_TAGS[cat as ExpenseCategory];
                    return (
                      <div
                        key={cat}
                        className="ml-2 border-l-2 border-primary/30 pl-3 space-y-2"
                      >
                        <p className="text-xs font-medium text-muted-foreground">
                          {cat}について、特に重視するものは?{" "}
                          <span className="font-normal">(任意・複数選択可)</span>
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                          {tags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => togglePreferenceTag(tag.id)}
                              className={cn(
                                "flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs text-left transition-colors",
                                preferenceTags.includes(tag.id)
                                  ? "border-primary bg-primary/10 font-medium"
                                  : "border-border hover:bg-muted/50"
                              )}
                            >
                              <span>{tag.emoji}</span>
                              <span>{tag.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 車種サブ質問: 車関連費を選んだ時のみ表示 */}
              {hasCarCategory && (
                <div className="ml-2 mt-1 border-l-2 border-primary/30 pl-3 space-y-2">
                  <p className="text-sm font-medium">お車の種類は?</p>
                  <p className="text-xs text-muted-foreground">種類によって使える優待が変わります</p>
                  <div className="grid grid-cols-1 gap-2">
                    {VEHICLE_OPTIONS.map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setVehicleType(vehicleType === value ? null : value)}
                        className={cn(
                          "rounded-lg border p-2.5 text-sm text-left transition-colors",
                          vehicleType === value
                            ? "border-primary bg-primary/10 font-medium"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

          {/* Step 3: 今年度の優待予算 */}
          {currentStep === 3 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">今年度、優待に使える予算は?</h2>
                <p className="text-sm text-muted-foreground">
                  総資産ではなく、今年新たに優待用に投資できる金額の目安です。半角数字で入力してください(例: 150 → 150万円)
                </p>
                <p className="text-xs text-muted-foreground">
                  今年の予算で埋まらない月があっても大丈夫。来年以降も少しずつ買い足しながら、1年かけて優待カレンダーを完成させていけます。
                </p>
              </div>
              <div
                className={cn(
                  "rounded-lg border px-4 py-4 transition-colors",
                  isInvestmentOverLimit
                    ? "border-destructive/50"
                    : isInvestmentValid
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={investmentInput}
                    onChange={handleInvestmentInputChange}
                    placeholder="例: 150"
                    autoFocus
                    className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground/40"
                  />
                  <span className="shrink-0 text-sm font-medium text-muted-foreground">万円</span>
                </div>
                {isInvestmentValid && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    = {formatInvestmentLabel(parsedManYen * 10000)}
                  </p>
                )}
                {!isNaN(parsedManYen) && parsedManYen === 0 && investmentInput.length > 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    0より大きい金額を入力してください
                  </p>
                )}
                {isInvestmentOverLimit && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    入力できる上限は {INVESTMENT_MAX_MAN_YEN.toLocaleString()}万円(10億円)です
                  </p>
                )}
              </div>
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
                  {hasCarCategory && vehicleType && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      お車: {VEHICLE_LABELS[vehicleType] ?? vehicleType}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* 嗜好タグ確認(選択がある場合のみ表示) */}
              {preferenceTags.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>嗜好タグ</CardTitle>
                      <button
                        onClick={() => router.push("/onboarding?step=1")}
                        className="text-xs text-accent hover:underline"
                      >
                        修正
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {preferenceTags.map((tagId) => {
                        const tag = ALL_PREFERENCE_TAGS_FLAT.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {tag.emoji} {tag.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    <CardTitle>今年度の優待予算</CardTitle>
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
                      ? "未入力"
                      : formatInvestmentLabel(maxInvestment)}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>

      {currentStep > 0 && (
        <NavigationButtons
          currentStep={currentStep}
          isNextDisabled={currentStep === 3 ? !isInvestmentValid : false}
          resultsHref={resultsHref}
        />
      )}
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
