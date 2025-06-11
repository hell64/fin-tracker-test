import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TransactionsList } from "./_components/list";
import { TransactionFilters } from "./_components/filters";
import { TransactionDialog } from "./_components/dialog";
import { getTransactions } from "@/app/actions/transaction";
import { SearchParams, useQueryState } from "nuqs";
import { transactionSearchParamsCache } from "@/lib/search-params";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getCategories } from "@/app/actions/category";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TransactionsContainer } from "./_components/container";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { category, date, type, page } = transactionSearchParamsCache.parse(
    await searchParams
  );

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const transactions = await getTransactions(page, 10, {
    category: category === "all" ? "all" : category,
    type: type === "all" ? "all" : type,
    date: date ? new Date(date) : undefined,
  });

  const categories = await getCategories();

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Транзакції"
        text="Керуйте своїми транзакціями."
      ></DashboardHeader>
      <Suspense fallback={<div>Loading...</div>}>
        <TransactionsContainer
          categories={categories}
          initialTransactions={transactions}
        />
      </Suspense>
    </DashboardShell>
  );
}
