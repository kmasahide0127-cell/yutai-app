import { EXPERIENCE_TAGS } from "@/lib/experience-data";
import type { ExperienceInterest, ExperienceInterestMap, ExperienceSortMode } from "@/lib/experience-matching";
import { getInterest } from "@/lib/experience-matching";

const INTEREST_OPTIONS: Array<{ value: ExperienceInterest; label: string }> = [
  { value: "unexperienced", label: "未経験" },
  { value: "want-again", label: "また利用したい" },
  { value: "not-interested", label: "興味なし" },
];

/**
 * 体験提案モードの入力フォーム。
 *
 * JS不要のGETフォームにしている(逆引きモードの ProductSearchForm と同じ方針)。
 * 各タグの興味状態はネイティブの radio 3択で、未回答時は「未経験」を
 * 既定値にする(defaultChecked)。「経験あり→除外」を固定ルールにしないため、
 * 未経験/また利用したいのどちらも対等な選択肢として並べている。
 */
export function ExperienceInterestForm({
  interests,
  maxInvestment,
  sortMode,
}: {
  interests: ExperienceInterestMap;
  maxInvestment?: number;
  sortMode: ExperienceSortMode;
}) {
  return (
    <form action="/experiences" method="get" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-base font-bold">気になる体験を選んでください</h2>
        <p className="text-xs text-muted-foreground">
          「また利用したい」も「未経験」もどちらも候補に含めます。除外したいものだけ「興味なし」にしてください。
        </p>
        <div className="space-y-2">
          {EXPERIENCE_TAGS.map(({ tag, label, emoji }) => {
            const current = getInterest(interests, tag);
            return (
              <fieldset
                key={tag}
                className="rounded-lg border border-border bg-card p-3"
              >
                <legend className="px-1 text-sm font-medium">
                  {emoji} {label}
                </legend>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                  {INTEREST_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <input
                        type="radio"
                        name={`exp_${tag}`}
                        value={opt.value}
                        defaultChecked={current === opt.value}
                        className="accent-primary"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="maxInvestment" className="text-sm font-bold">
          投資可能額(任意)
        </label>
        <p className="text-xs text-muted-foreground">
          入力すると、この金額で「届く特典」と「届かない特典」を分けて表示します。
        </p>
        <div className="flex items-center gap-2">
          <input
            id="maxInvestment"
            type="number"
            name="maxInvestment"
            defaultValue={maxInvestment ?? ""}
            placeholder="例: 500000"
            min={0}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          <span className="shrink-0 text-sm text-muted-foreground">円</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold">並び順</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="sort"
              value="efficiency"
              defaultChecked={sortMode === "efficiency"}
              className="accent-primary"
            />
            投資効率(少ない投資額で得られる割引を優先)
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="sort"
              value="amount"
              defaultChecked={sortMode === "amount"}
              className="accent-primary"
            />
            1回あたりの割引額が大きい順
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        候補を見る
      </button>
    </form>
  );
}
