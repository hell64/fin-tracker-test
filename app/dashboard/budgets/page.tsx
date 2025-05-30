import { BudgetsList } from "./_components/list";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BudgetDialog } from "./_components/dialog";
import { getUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { SearchParams } from "next/dist/server/request/search-params";
// import { getCategories } from "../actions/category";
// import { getBudgets } from "../actions/budget";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function BudgetsPage({ searchParams }: PageProps) {
  // const user = await getUser();
  // const categories = await getCategories();
  // // const budgets = await getBudgets();

  // const categoriesData = categories.data || [];
  // // const budgetsData = budgets.data || [];

  // if (!user) {
  //   redirect("/login");
  // }

  return (
    <DashboardShell>
      <DashboardHeader heading="Бюджети" text="Керуйте своїми бюджетами">
        {/* <BudgetDialog categories={categoriesData} /> */}
      </DashboardHeader>
      <BudgetsList />
    </DashboardShell>
  );
}
