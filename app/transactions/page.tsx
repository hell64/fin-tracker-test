import { redirect } from "next/navigation";

import { getUser } from "@/app/actions/auth-actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TransactionsList } from "@/components/transactions/transactions-list";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";

export default async function TransactionsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Транзакції"
        text="Управляйте своїми транзакціями."
      >
        <TransactionDialog />
      </DashboardHeader>
      <TransactionFilters />
      <TransactionsList />
    </DashboardShell>
  );
}
