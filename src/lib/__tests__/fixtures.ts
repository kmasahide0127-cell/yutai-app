import type { Yutai } from "@/lib/yutai-data";

// テスト用の銘柄データを作る。
// 実データ(YUTAI_LIST)は週次の株価更新や銘柄追加で値が変わるため、ロジックのテストは
// 必要な項目だけを指定した架空の銘柄で行い、期待値を手計算できるようにしている。
export function makeYutai(overrides: Partial<Yutai> & { code: string }): Yutai {
  return {
    id: overrides.code,
    name: `テスト銘柄${overrides.code}`,
    brands: [],
    categories: ["その他"],
    lifestyleTags: [],
    minShares: 100,
    approxInvestment: 100000,
    annualValue: 1000,
    yieldPercent: 1,
    description: "",
    rightsMonths: [3],
    dataQuality: "verified",
    lastVerified: "2026-01-01",
    ...overrides,
  };
}
