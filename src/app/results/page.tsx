import {
  matchYutaiByExpense,
  type ExpenseCategory,
} from "@/lib/matching";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { ResultsClient } from "@/components/results/ResultsClient";

type SearchParams = Promise<{
  expenses?: string;
  maxInvestment?: string;
}>;

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { expenses: expensesParam, maxInvestment: maxParam } = await searchParams;

  const expenseCategories = (
    expensesParam?.split(",").filter(Boolean) ?? []
  ) as ExpenseCategory[];
  const maxInvestment = maxParam ? parseInt(maxParam, 10) : undefined;

  const results = matchYutaiByExpense(
    { expenseCategories, brands: [], maxInvestment },
    YUTAI_LIST
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold">あなたの生活にマッチした優待</h1>
        </header>

        <ResultsClient
          results={results}
          expenseCategoryCount={expenseCategories.length}
        />
      </div>
    </div>
  );
}
