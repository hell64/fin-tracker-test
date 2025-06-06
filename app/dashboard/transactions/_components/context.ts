// contexts/transaction-context.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";

type TransactionContextType = {
  refreshTransactions: () => Promise<void>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within TransactionProvider"
    );
  }
  return context;
}

export { TransactionContext };
