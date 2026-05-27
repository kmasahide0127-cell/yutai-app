import {
  matchYutaiByExpense,
  type ExpenseCategory,
} from "@/lib/matching";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { ResultsClient } from "@/components/results/ResultsClient";

type SearchParams = Promise<{
  brands?: string;
  expenses?: string;
  maxInvestment?: string;
}>;

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    expenses: expensesParam,
    maxInvestment: maxParam,
  } = await searchParams;

  const expenseCategories = (
    expensesParam?.split(",").filter(Boolean) ?? []
  ) as ExpenseCategory[];
  const maxInvestment = maxParam ? parseInt(maxParam, 10) : undefined;

  const results = matchYutaiByExpense(
    { expenseCategories, brands: [], maxInvestment },
    YUTAI_LIST
  );

  const totalSavings = results.reduce((sum, r) => sum + r.annualSavings, 0);
  const totalInvestment = results.reduce(
    (sum, r) => sum + r.yutai.approxInvestment,
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">あなたの生活にマッチした優待</h1>
          {results.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {results.length}件がマッチしました
            </p>
          ) : null}
        </header>

        <ResultsClient
          results={results}
          totalSavings={totalSavings}
          totalInvestment={totalInvestment}
        />
      </div>
    </div>
  );
}
