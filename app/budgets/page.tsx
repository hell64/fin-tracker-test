import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BudgetsList } from "@/components/budgets/budgets-list";

export default async function BudgetsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Бюджети"
        text="Управляй своїми щомісячними бюджетами."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Створити бюджет
        </Button>
      </DashboardHeader>
      <BudgetsList />
    </DashboardShell>
  );
}
