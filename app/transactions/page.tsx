import { redirect } from "next/navigation";

import { getUser } from "@/app/actions/auth-actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TransactionsList } from "@/components/transactions/transactions-list";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { getTransactions } from "../actions/transaction-actions";
import { SearchParams, useQueryState } from "nuqs";
import {
  loadSearchParams,
  transactionSearchParamsCache,
} from "@/lib/search-params";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getCategories } from "../actions/category-actions";
import { Suspense } from "react";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function TransactionsPage({ searchParams }: PageProps) {
  const user = await getUser();
  // const { category, date, type, page } = await loadSearchParams(searchParams);
  const { category, date, type, page } = transactionSearchParamsCache.parse(
    await searchParams
  );

  const transactions = await getTransactions(page, 10, {
    category: category === "all" ? "all" : category,
    type: type === "all" ? "all" : type,
    date: date ? new Date(date) : undefined,
  });

  const categories = await getCategories();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Транзакції" text="Керуйте своїми транзакціями.">
        <TransactionDialog categories={categories} />
      </DashboardHeader>
      <TransactionFilters categories={categories} />
      <Suspense fallback={<div>Loading...</div>}>
        <TransactionsList transactions={transactions} />
      </Suspense>
    </DashboardShell>
  );
}
