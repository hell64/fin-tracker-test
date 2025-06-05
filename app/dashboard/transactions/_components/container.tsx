// _components/transactions-container.tsx
"use client";

import { useQueryState } from "nuqs";
import { TransactionsList } from "./list";
import { TransactionFilters } from "./filters";
import { useEffect, useState } from "react";
import { getTransactions } from "@/app/actions/transaction";

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

  useEffect(() => {
    async function fetchTransactions() {
      const newTransactions = await getTransactions(parseInt(page), 10, {
        category: category === "all" ? "all" : category,
        type: type === "all" ? "all" : type,
        date: date ? new Date(date) : undefined,
      });
      setTransactions(newTransactions);
    }

    fetchTransactions();
  }, [category, type, date, page]);

  return (
    <>
      <TransactionFilters categories={categories} />
      <TransactionsList transactions={transactions} categories={categories} />
    </>
  );
}
