import type { Metadata } from "next";
import Link from "next/link";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { EXPERIENCE_TAGS, EXPERIENCE_DATA_LAST_UPDATED, type ExperienceTag } from "@/lib/experience-data";
import {
  buildExperienceSections,
  getDefaultSortMode,
  type ExperienceInterest,
  type ExperienceInterestMap,
  type ExperienceMatch,
  type ExperienceSortMode,
} from "@/lib/experience-matching";
import { AppHeader } from "@/components/AppHeader";
import { ModeTabs } from "@/components/search/ModeTabs";
import { ExperienceInterestForm } from "@/components/experience/ExperienceInterestForm";
import { ExperienceMatchCard } from "@/components/experience/ExperienceMatchCard";

export const metadata: Metadata = {
  title: "体験から株主優待を探す | 優待マッチ",
  description:
    "クルーズ・温泉旅館・レストラン・ゴルフなど、したい体験から株主優待銘柄を提案します。投資可能額を入れると「届く特典」と「届かない特典」を分けて表示します。",
  alternates: { canonical: "/experiences" },
};

const VALID_INTERESTS: ExperienceInterest[] = ["unexperienced", "want-again", "not-interested"];

type SearchParams = Promise<Record<string, string | undefined>>;

function parseInterests(params: Record<string, string | undefined>): ExperienceInterestMap {
  const interests: ExperienceInterestMap = {};
  for (const { tag } of EXPERIENCE_TAGS) {
    const raw = params[`exp_${tag}`];
    if (raw && (VALID_INTERESTS as string[]).includes(raw)) {
      interests[tag] = raw as ExperienceInterest;
    }
  }
  return interests;
}

/** フォーム送信済みかどうか(1つでも exp_* パラメータがあれば送信済みとみなす) */
function hasSubmitted(params: Record<string, string | undefined>): boolean {
  return EXPERIENCE_TAGS.some(({ tag }) => params[`exp_${tag}`] !== undefined);
}

export default async function ExperiencesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const submitted = hasSubmitted(params);

  const maxInvestmentRaw = params.maxInvestment ? Number(params.maxInvestment) : undefined;
  const maxInvestment =
    maxInvestmentRaw && Number.isFinite(maxInvestmentRaw) && maxInvestmentRaw > 0
      ? maxInvestmentRaw
      : undefined;

  const sortParam = params.sort;
  const sortMode: ExperienceSortMode =
    sortParam === "amount" || sortParam === "efficiency"
      ? sortParam
      : getDefaultSortMode(maxInvestment);

  const interests = parseInterests(params);
  const sections = submitted
    ? buildExperienceSections(interests, YUTAI_LIST, sortMode, maxInvestment)
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            トップ
          </Link>
          <span className="mx-2">›</span>
          <span>体験から探す</span>
        </nav>

        <header className="space-y-1">
          <h1 className="text-2xl font-bold">体験から株主優待を探す</h1>
          <p className="text-sm text-muted-foreground">
            クルーズ・温泉旅館・レストラン・ゴルフなど、したい体験を選ぶと該当する優待銘柄の候補を提案します。
          </p>
        </header>

        <ModeTabs active="experience" />

        {!submitted && (
          <section className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              「未経験」「また利用したい」のどちらも候補として含めます。すでに経験済みだからといって
              自動的に除外はしません。「興味なし」を選んだ体験だけを候補から外します。
            </p>
            <p>
              投資可能額を入れると、その金額で「届く特典」と「届かない特典」に分けて表示します。
              並び順は「投資効率」と「1回あたりの割引額」を切り替えられます(投資可能額が小さいほど投資効率を既定にしています)。
            </p>
            <p className="text-xs">
              ※ 本サービスは情報提供のみを目的としており、投資助言・投資勧誘にはあたりません。
              割引額・割引率は各体験の目安金額との比較による参考値です。優待内容は変更・廃止される場合があります。
              投資判断はご自身の責任でお願いします。
            </p>
          </section>
        )}

        <div className="rounded-xl border border-border bg-card p-4">
          <ExperienceInterestForm
            interests={interests}
            maxInvestment={maxInvestment}
            sortMode={sortMode}
          />
        </div>

        {submitted && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                並び順:{" "}
                {sortMode === "efficiency" ? "投資効率(コスパ優先)" : "1回あたりの割引額(大きい順)"}
              </span>
              {maxInvestment && <span>投資可能額: {maxInvestment.toLocaleString()}円</span>}
            </div>

            {sections.length === 0 ? (
              <p className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                すべての体験が「興味なし」に設定されています。上のフォームで見直してください。
              </p>
            ) : (
              <div className="space-y-6">
                {sections.map((section) => (
                  <ExperienceSection
                    key={section.tag}
                    tag={section.tag}
                    matches={section.matches}
                    reachableMatches={section.reachableMatches}
                    unreachableMatches={section.unreachableMatches}
                  />
                ))}
              </div>
            )}

            <section className="space-y-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                ・表示しているのは候補・参考情報です。特定銘柄の売買を勧めるものではありません。
                投資判断はご自身の責任でお願いします。
              </p>
              <p>
                ・1回あたりの割引額・割引率・投資効率は、各体験の目安金額(typicalUnitPrice)と
                優待の年間価値を比較した参考値であり、実際の割引条件は施設・プランにより異なります。
              </p>
              <p>・優待内容・継続保有条件は変更・廃止される場合があります。最新情報は各企業のIRページでご確認ください。</p>
              <p>・体験タグデータの最終更新: {EXPERIENCE_DATA_LAST_UPDATED}</p>
            </section>
          </>
        )}

        <div className="flex flex-wrap gap-3 pt-2 text-sm">
          <Link href="/stocks" className="text-primary hover:underline">
            銘柄一覧を見る
          </Link>
          <Link href="/onboarding" className="text-primary hover:underline">
            生活から診断する
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExperienceSection({
  tag,
  matches,
  reachableMatches,
  unreachableMatches,
}: {
  tag: ExperienceTag;
  matches: ExperienceMatch[];
  reachableMatches: ExperienceMatch[] | null;
  unreachableMatches: ExperienceMatch[] | null;
}) {
  const meta = EXPERIENCE_TAGS.find((t) => t.tag === tag)!;
  const hasSplit = reachableMatches !== null && unreachableMatches !== null;

  return (
    <section className="space-y-3" aria-labelledby={`exp-${tag}-heading`}>
      <div className="space-y-0.5">
        <h2 id={`exp-${tag}-heading`} className="text-base font-bold">
          {meta.emoji} {meta.label}
        </h2>
        <p className="text-xs text-muted-foreground">
          目安 {meta.typicalUnitPrice.toLocaleString()}円/回・{meta.companionLabel}・{meta.leadTime}
        </p>
      </div>

      {matches.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          現在該当する銘柄はありません
        </p>
      ) : hasSplit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              届く特典({reachableMatches!.length}件)
            </p>
            {reachableMatches!.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                この投資可能額で届く候補は現在ありません
              </p>
            ) : (
              <div className="space-y-2">
                {reachableMatches!.map((m) => (
                  <ExperienceMatchCard key={m.yutai.id} match={m} />
                ))}
              </div>
            )}
          </div>
          {unreachableMatches!.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                届かない特典(参考・{unreachableMatches!.length}件)
              </p>
              <div className="space-y-2">
                {unreachableMatches!.map((m) => (
                  <ExperienceMatchCard key={m.yutai.id} match={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <ExperienceMatchCard key={m.yutai.id} match={m} />
          ))}
        </div>
      )}
    </section>
  );
}
