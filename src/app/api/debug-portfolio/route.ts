// 開発用: 保有株3軸分析の動作確認エンドポイント。本番では呼ばれない想定。
import { NextResponse } from "next/server";
import {
  resolveHoldings,
  analyzeRightsMonthGaps,
  analyzeCategoryBias,
  analyzeRedundancy,
  suggestForGaps,
} from "@/lib/portfolio";
import { YUTAI_LIST } from "@/lib/yutai-data";

export function GET() {
  // すかいらーく(名前)、コロワイド(名前)、9432(NTTコード)、トヨタ(DB外)
  const sampleInputs = ["すかいらーく", "コロワイド", "9432", "トヨタ"];

  const resolved = resolveHoldings(sampleInputs);
  const rightsMonthGaps = analyzeRightsMonthGaps(resolved);
  const categoryBias = analyzeCategoryBias(resolved);
  const redundancy = analyzeRedundancy(resolved);
  const suggestions = suggestForGaps(resolved, YUTAI_LIST);

  return NextResponse.json({
    sample_inputs: sampleInputs,

    // 解決結果: DB外銘柄が found: false になるかを確認
    resolved: resolved.map((r) => ({
      input: r.input,
      found: r.found,
      matched: r.yutai
        ? {
            code: r.yutai.code,
            name: r.yutai.name,
            categories: r.yutai.categories,
            rightsMonths: r.yutai.rightsMonths,
          }
        : null,
    })),

    analysis: {
      // 軸1: 空き月一覧(例: 外食2銘柄+NTTだと3,6,9,12が埋まり8ヶ月空き)
      rightsMonthGaps,

      // 軸2: 外食に偏りがあるか
      categoryBias: {
        dominantCategories: categoryBias.dominantCategories,
        missingCategoryCount: categoryBias.missingCategories.length,
        missingCategoriesSample: categoryBias.missingCategories.slice(0, 10),
      },

      // 軸3: 同一ジャンル重複
      redundancy,
    },

    // 穴埋め提案(候補あり月のみ先頭3ヶ月 / 候補ありカテゴリのみ先頭5件)
    suggestions: {
      forEmptyMonths: suggestions.forEmptyMonths
        .filter((s) => s.suggestions.length > 0)
        .slice(0, 3)
        .map((s) => ({
          month: s.month,
          candidates: s.suggestions.map((y) => ({
            code: y.code,
            name: y.name,
            annualValue: y.annualValue,
            rightsMonths: y.rightsMonths,
          })),
        })),
      forMissingCategories: suggestions.forMissingCategories
        .filter((s) => s.suggestions.length > 0)
        .slice(0, 5)
        .map((s) => ({
          category: s.category,
          candidates: s.suggestions.map((y) => ({
            code: y.code,
            name: y.name,
            annualValue: y.annualValue,
          })),
        })),
    },
  });
}
