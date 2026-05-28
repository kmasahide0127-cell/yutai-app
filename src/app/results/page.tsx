import {
  matchYutaiByExpenseGrouped,
  buildCalendarPackage,
  type ExpenseCategory,
  type CategoryGroup,
  type CalendarPackage,
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

  const lifestyle = { expenseCategories, brands: [], maxInvestment };

  const groupedMap = matchYutaiByExpenseGrouped(lifestyle, YUTAI_LIST);
  const calendarPackage: CalendarPackage = buildCalendarPackage(lifestyle, YUTAI_LIST);

  // Map → 配列変換(Server→Client propsはシリアライズ可能な型のみ)
  const groupedResults: CategoryGroup[] = expenseCategories.map((cat) => ({
    category: cat,
    results: groupedMap.get(cat) ?? [],
  }));

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold">あなたの生活にマッチした優待</h1>
        </header>

        <ResultsClient
          groupedResults={groupedResults}
          expenseCategoryCount={expenseCategories.length}
          calendarPackage={calendarPackage}
        />
      </div>
    </div>
  );
}
