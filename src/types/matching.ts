import type { Yutai } from "@/lib/yutai-data";

export type UserLifestyle = {
  brands: string[];
  lifestyleTags: string[];
  maxInvestment?: number;
};

export type MatchResult = {
  yutai: Yutai;
  score: number;
  matchedBrands: string[];
  matchedTags: string[];
  matchReason: string;
};
