// _components/transactions-container.tsx
"use client";

import { useQueryState } from "nuqs";
import { TransactionsList } from "./list";
import { TransactionFilters } from "./filters";
import { useCallback, useEffect, useState, useTransition } from "react";
import { getTransactions } from "@/app/actions/transaction";
import { TransactionContext } from "./context";
import { TransactionDialog } from "./dialog";

export function TransactionsContainer({
  categories,
  initialTransactions,
}: {
  categories: any;
  initialTransactions: any;
}) {
  const [category] = useQueryState("category", { defaultValue: "all" });
  const [type] = useQueryState("type", { defaultValue: "all" });
  const [date] = useQueryState("date");
  const [page] = useQueryState("page", { defaultValue: "1" });

  const [transactions, setTransactions] = useState(initialTransactions);
  const [isPending, startTransition] = useTransition();

  const refreshTransactions = useCallback(async () => {
    startTransition(async () => {
      const newTransactions = await getTransactions(parseInt(page), 10, {
        category: category === "all" ? "all" : category,
        type: type === "all" ? "all" : type,
        date: date ? new Date(date) : undefined,
      });
      setTransactions(newTransactions);
    });
  }, [category, type, date, page]);

  // Fetch transactions when params change
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  return (
    <>
      <TransactionContext.Provider value={{ refreshTransactions }}>
        <TransactionDialog categories={categories} />
        <TransactionFilters categories={categories} />
        <TransactionsList transactions={transactions} categories={categories} />
      </TransactionContext.Provider>
    </>
  );
}
