import { Suspense } from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { AppHeader } from "@/components/AppHeader";
import { ExperienceGuide } from "@/components/experience/ExperienceGuide";
import { ExperiencesFromQuery, ExperiencesView } from "@/components/experience/ExperiencesView";

export const metadata: Metadata = buildPageMetadata({
  title: "体験から株主優待を探す",
  description:
    "クルーズ・温泉旅館・レストラン・ゴルフなど、したい体験から株主優待銘柄を提案します。投資可能額を入れると「届く特典」と「届かない特典」を分けて表示します。",
  path: "/experiences",
});

// ページは静的に生成し、?exp_…= の条件による提案はブラウザで計算する
// (条件の組み合わせごとにサーバーでページを作らず、Vercel の Fast Origin Transfer を抑えるため)。
// 静的 HTML(Suspense の fallback)には未送信の入力画面が入る。
export default function ExperiencesPage() {
  const guide = <ExperienceGuide />;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <Suspense fallback={<ExperiencesView guide={guide} />}>
        <ExperiencesFromQuery guide={guide} />
      </Suspense>
    </div>
  );
}
