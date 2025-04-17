import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { BudgetProgress } from "@/components/dashboard/budget-progress";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Дашбоард"
        text="Ваша фінансова статистика та остання активність."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewStats />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SpendingChart className="lg:col-span-4" />
        <BudgetProgress className="lg:col-span-3" />
      </div>
      <RecentTransactions />
    </DashboardShell>
  );
}
