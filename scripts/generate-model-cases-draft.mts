// 組み合わせ例(参考)の説明文の下書きを docs/model-cases-draft.md に出力する。
//
// 実行: node --import ./scripts/ts-alias-register.mjs scripts/generate-model-cases-draft.mts
//
// 下書きは計算結果の事実(入力条件・組み合わせ・カバー月・空く月)だけから機械的に作る。
// 公開用の説明文は運営者が書くため、このファイルの文章をそのままページに載せないこと。
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { MODEL_CASES, runModelCase } from "../src/lib/model-cases.ts";
import { DATA_LAST_UPDATED } from "../src/lib/yutai-data.ts";

const months = (ms: number[]) => (ms.length > 0 ? ms.map((m) => `${m}月`).join("・") : "なし");
const yen = (v: number) => `${v.toLocaleString("ja-JP")}円`;

const lines: string[] = [
  "# 組み合わせ例(参考) 説明文の下書き",
  "",
  `> 自動生成(データ基準日 ${DATA_LAST_UPDATED})。診断と同じ計算(filterCandidatesForBudget → buildBudgetAwareCalendarPackage)の結果から作った下書きです。`,
  "> 公開前に運営者が説明文を書き直してください。「おすすめ」ではなく「組み合わせ例(参考)」と表記すること。",
  "> ページ: /model-cases(noindex・ナビ未リンク・sitemap 非掲載)",
  "",
];

for (const c of MODEL_CASES) {
  const r = runModelCase(c);
  lines.push(`## ${c.label}`, "");
  lines.push("### 入力条件", "");
  lines.push(`- 出費カテゴリ: ${c.expenseCategories.join("・")}`);
  lines.push(`- 今年の予算: ${yen(c.budget)}`);
  lines.push(`- 世帯人数: ${c.householdSize}人(カレンダーの組み立てには影響しない)`);
  lines.push(`- 好みのタグ: ${c.preferenceTags.length > 0 ? c.preferenceTags.join(", ") : "指定なし"}`);
  lines.push(`- 候補銘柄数: ${r.candidateCount}銘柄`, "");
  lines.push("### 組み合わせ", "");
  lines.push("| 銘柄 | 権利確定月(カレンダー上) | 年間優待価値 | 必要投資額 | 区分 |", "|---|---|---|---|---|");
  for (const { yutai, months: ms } of r.picks) {
    lines.push(
      `| ${yutai.name}(${yutai.code}) | ${months(ms)} | ${yen(yutai.annualValue)} | ${yen(yutai.approxInvestment)} | ${yutai.dataQuality === "verified" ? "検証済み" : "参考情報"} |`
    );
  }
  lines.push("");
  lines.push(`- カバー月: ${months(r.coveredMonths)}(${r.coveredMonths.length}ヶ月)`);
  lines.push(`- 空く月: ${months(r.emptyMonths)}`);
  lines.push(`- 必要投資額の合計: ${yen(r.totalInvestment)} / 年間優待価値の合計: ${yen(r.totalAnnualValue)}(${r.yieldPercent}%)`, "");
  lines.push("### 説明文の下書き(要書き直し)", "");
  lines.push(
    `${c.expenseCategories.join("・")}を選び、今年の予算を${yen(c.budget)}とした場合、` +
      `${r.picks.length}銘柄の組み合わせで12ヶ月中${r.coveredMonths.length}ヶ月に権利確定月が入りました。` +
      (r.emptyMonths.length > 0
        ? `${months(r.emptyMonths)}はこの条件では埋まりませんでした。`
        : "すべての月に権利確定月が入りました。") +
      `必要投資額の合計は${yen(r.totalInvestment)}で、年間優待価値の合計は${yen(r.totalAnnualValue)}です(掲載データ上の値・参考)。`,
    ""
  );
}

const out = path.resolve(import.meta.dirname, "../docs/model-cases-draft.md");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"));
console.log(`wrote ${out}`);
