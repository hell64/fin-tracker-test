import { BudgetsList } from "./_components/list";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BudgetDialog } from "./_components/dialog";
import { redirect } from "next/navigation";
import { SearchParams } from "next/dist/server/request/search-params";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCategories } from "@/app/actions/category";
import { getBudgets } from "@/app/actions/budget";
// import { getCategories } from "../actions/category";
// import { getBudgets } from "../actions/budget";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function BudgetsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const categories = await getCategories();

  const budgets = await getBudgets();

  return (
    <DashboardShell>
      <DashboardHeader heading="Бюджети" text="Керуйте своїми бюджетами">
        <BudgetDialog categories={categories} />
      </DashboardHeader>
      <BudgetsList budgets={budgets} categories={categories} spent={[]} />
    </DashboardShell>
  );
}
