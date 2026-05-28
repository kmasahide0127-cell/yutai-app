import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "あなたにマッチする優待",
  description: "毎月の出費から、削減できる株主優待を提案。あなたのライフスタイルにぴったりの優待が見つかります。",
  alternates: {
    canonical: "/results",
  },
  robots: {
    index: false,
    follow: true,
  },
};
import {
  matchYutaiByExpenseGrouped,
  buildCalendarPackage,
  filterCandidatesForBudget,
  buildBudgetPackage,
  type ExpenseCategory,
  type CategoryGroup,
  type CalendarPackage,
  type BudgetPackage,
  type UserExpenseLifestyle,
} from "@/lib/matching";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { ResultsClient } from "@/components/results/ResultsClient";

type SearchParams = Promise<{
  expenses?: string;
  maxInvestment?: string;
  household?: string;
}>;

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { expenses: expensesParam, maxInvestment: maxParam, household: householdParam } = await searchParams;

  const expenseCategories = (
    expensesParam?.split(",").filter(Boolean) ?? []
  ) as ExpenseCategory[];
  const maxInvestment = maxParam ? parseInt(maxParam, 10) : undefined;
  const householdSize = householdParam ? Math.max(1, parseInt(householdParam, 10)) : 1;

  const lifestyle: UserExpenseLifestyle = { expenseCategories, brands: [], maxInvestment };

  const groupedMap = matchYutaiByExpenseGrouped(lifestyle, YUTAI_LIST);
  const calendarPackage: CalendarPackage = buildCalendarPackage(lifestyle, YUTAI_LIST);

  const defaultBudget = lifestyle.maxInvestment ?? 500000;
  const budgetCandidates = filterCandidatesForBudget(lifestyle, YUTAI_LIST);
  const initialBudgetPackage: BudgetPackage = buildBudgetPackage(lifestyle, budgetCandidates, defaultBudget);

  // Map → 配列変換(Server→Client propsはシリアライズ可能な型のみ)
  const groupedResults: CategoryGroup[] = expenseCategories.map((cat) => ({
    category: cat,
    results: groupedMap.get(cat) ?? [],
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <header>
          <h1 className="text-2xl font-bold">あなたの生活にマッチした優待</h1>
        </header>

        <ResultsClient
          groupedResults={groupedResults}
          expenseCategoryCount={expenseCategories.length}
          calendarPackage={calendarPackage}
          initialBudgetPackage={initialBudgetPackage}
          budgetCandidates={budgetCandidates}
          lifestyle={lifestyle}
          householdSize={householdSize}
        />
      </div>
    </div>
  );
}
