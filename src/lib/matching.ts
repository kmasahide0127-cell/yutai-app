import type { Yutai } from "./yutai-data";
import type { MatchResult, UserLifestyle } from "@/types/matching";

function generateMatchReason(
  matchedBrands: string[],
  matchedTags: string[]
): string {
  const brandText = matchedBrands.map((b) => `『${b}』`).join("");
  const tagText = matchedTags.map((t) => `『${t}』`).join("");

  if (matchedBrands.length > 0 && matchedTags.length > 0) {
    return `あなたが使う${brandText}に加え、${tagText}のライフスタイルにマッチ`;
  }
  if (matchedBrands.length > 0) {
    return `あなたが使う${brandText}の優待です`;
  }
  return `${tagText}のあなたに合う優待です`;
}

export function matchYutai(
  lifestyle: UserLifestyle,
  yutaiList: Yutai[]
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const yutai of yutaiList) {
    if (
      lifestyle.maxInvestment !== undefined &&
      yutai.approxInvestment > lifestyle.maxInvestment
    ) {
      continue;
    }

    const matchedBrands = yutai.brands.filter((brand) =>
      lifestyle.brands.includes(brand)
    );
    const matchedTags = yutai.lifestyleTags.filter((tag) =>
      lifestyle.lifestyleTags.includes(tag)
    );

    const score = Math.min(
      matchedBrands.length * 30 + matchedTags.length * 15,
      100
    );

    if (score <= 0) continue;

    results.push({
      yutai,
      score,
      matchedBrands,
      matchedTags,
      matchReason: generateMatchReason(matchedBrands, matchedTags),
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function getAllBrands(yutaiList: Yutai[]): string[] {
  const brands = new Set<string>();
  for (const yutai of yutaiList) {
    for (const brand of yutai.brands) {
      brands.add(brand);
    }
  }
  return Array.from(brands).sort();
}

export function getAllLifestyleTags(yutaiList: Yutai[]): string[] {
  const tags = new Set<string>();
  for (const yutai of yutaiList) {
    for (const tag of yutai.lifestyleTags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

// ── 使用例 ──────────────────────────────────────────────────────
//
// 例1: 楽天ユーザー → 楽天グループだけマッチ
// matchYutai(
//   { brands: ["楽天市場", "楽天モバイル"], lifestyleTags: [] },
//   YUTAI_LIST
// );
// → [{ yutai: 楽天グループ, score: 60, matchedBrands: ["楽天市場", "楽天モバイル"],
//       matchReason: "あなたが使う『楽天市場』『楽天モバイル』の優待です" }]
//
// 例2: 国内旅行 + 車所有 → リゾートトラスト・ENEOS等がマッチ
// matchYutai(
//   { brands: [], lifestyleTags: ["国内旅行派", "車所有"] },
//   YUTAI_LIST
// );
// → リゾートトラスト(score:30)、ANA HD(score:15)、JAL(score:15)、
//   ENEOS HD(score:15)、出光興産(score:15) などが返る
//
// 例3: maxInvestment 30万円 → 高額銘柄は除外
// matchYutai(
//   { brands: ["楽天市場"], lifestyleTags: ["国内旅行派"], maxInvestment: 300000 },
//   YUTAI_LIST
// );
// → approxInvestment > 300000 の王将フードサービス・KDDI・日清食品HD等は除外される
