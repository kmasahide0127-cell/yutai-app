// /results と /api/og で共有する URL パラメータの検証。
// クエリ文字列は誰でも自由に組み立てられるため、ホワイトリスト外の値を
// そのまま画面やシェアURLに出すと「このサイトは〇〇」のような任意文言を
// 当サイトのドメイン上に表示させるコンテンツ偽装に悪用できる。
// ここで許可値・上限に正規化してから使う。
import {
  EXPENSE_CATEGORIES,
  PREFERENCE_TAGS,
  type ExpenseCategory,
  type PreferenceTag,
} from "@/lib/matching";
import type { VehicleType } from "@/store/onboarding-store";

// 個人投資家の1銘柄あたり投資上限として十分大きく、計算量や表示崩れを防げる値
const MAX_INVESTMENT_LIMIT = 100_000_000;
const MAX_TOTAL_BUDGET_LIMIT = 10_000_000_000;
// オンボーディングの選択肢は「4人以上」までだが、手入力URLの余裕を見て上限10人
const MAX_HOUSEHOLD_SIZE = 10;

const VALID_EXPENSE_CATEGORIES = new Set<string>(EXPENSE_CATEGORIES);
const VALID_TAG_IDS = new Set<string>(
  Object.values(PREFERENCE_TAGS).flat().map((t) => t.id)
);

// 同名パラメータが複数あると Next.js は配列で渡してくるため string[] も受ける
type RawValue = string | string[] | undefined;

export type RawResultParams = {
  expenses?: RawValue;
  maxInvestment?: RawValue;
  household?: RawValue;
  vehicleType?: RawValue;
  preferenceTags?: RawValue;
  totalBudget?: RawValue;
  planYears?: RawValue;
};

export type ResultParams = {
  expenseCategories: ExpenseCategory[];
  maxInvestment: number | undefined;
  householdSize: number;
  vehicleType: VehicleType;
  preferenceTags: PreferenceTag[];
  totalStockBudget: number | null;
  planYears: 5 | 10 | null;
};

function first(raw: RawValue): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/** 正の整数かつ上限以下なら返す。それ以外は null */
function parsePositiveInt(rawValue: RawValue, max: number): number | null {
  const raw = first(rawValue);
  // オンボーディングは「万円 × 10000」で組み立てるため浮動小数誤差の小数部が付くことがある。
  // 従来の parseInt と同じく小数部は切り捨てる
  if (!raw || !/^\d{1,12}(\.\d+)?$/.test(raw)) return null;
  const n = Math.floor(Number(raw));
  return n > 0 && n <= max ? n : null;
}

/** カンマ区切りを許可集合でフィルタし、重複を除いて返す */
function parseList<T extends string>(rawValue: RawValue, valid: Set<string>): T[] {
  const raw = first(rawValue);
  if (!raw) return [];
  const result = new Set<T>();
  for (const item of raw.split(",")) {
    if (valid.has(item)) result.add(item as T);
  }
  return Array.from(result);
}

export function parseResultParams(raw: RawResultParams): ResultParams {
  const household = parsePositiveInt(raw.household, MAX_HOUSEHOLD_SIZE);
  const planYears = parsePositiveInt(raw.planYears, 10);
  const vehicleType = first(raw.vehicleType);

  return {
    expenseCategories: parseList<ExpenseCategory>(raw.expenses, VALID_EXPENSE_CATEGORIES),
    maxInvestment: parsePositiveInt(raw.maxInvestment, MAX_INVESTMENT_LIMIT) ?? undefined,
    householdSize: household ?? 1,
    vehicleType:
      vehicleType === "gasoline" || vehicleType === "ev" || vehicleType === "none"
        ? vehicleType
        : null,
    preferenceTags: parseList<PreferenceTag>(raw.preferenceTags, VALID_TAG_IDS),
    totalStockBudget: parsePositiveInt(raw.totalBudget, MAX_TOTAL_BUDGET_LIMIT),
    planYears: planYears === 5 || planYears === 10 ? planYears : null,
  };
}

/** 検証済みの値だけでシェア用・OG画像用のクエリ文字列を組み立てる */
export function buildShareQuery(params: ResultParams): string {
  const qp = new URLSearchParams();
  if (params.expenseCategories.length > 0) qp.set("expenses", params.expenseCategories.join(","));
  if (params.maxInvestment !== undefined) qp.set("maxInvestment", String(params.maxInvestment));
  if (params.householdSize > 1) qp.set("household", String(params.householdSize));
  if (params.vehicleType) qp.set("vehicleType", params.vehicleType);
  if (params.preferenceTags.length > 0) qp.set("preferenceTags", params.preferenceTags.join(","));
  return qp.toString();
}
