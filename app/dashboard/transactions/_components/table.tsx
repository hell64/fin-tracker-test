"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import type { FilteredTransaction } from "@/app/actions/transaction";

interface TransactionTableProps {
  transactions: FilteredTransaction[];
  loading?: boolean;
}

export function TransactionTable({
  transactions,
  loading,
}: TransactionTableProps) {
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 text-center">
        <p className="text-gray-400 text-lg">Транзакції не знайдено</p>
        <p className="text-gray-500 text-sm mt-2">
          Спробуйте змінити фільтри або додати нові транзакції
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800">
            <TableHead className="text-gray-300 font-medium">Сума</TableHead>
            <TableHead className="text-gray-300 font-medium">Дата</TableHead>
            <TableHead className="text-gray-300 font-medium">
              Категорія
            </TableHead>
            <TableHead className="text-gray-300 font-medium">Опис</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              className="border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {transaction.type === "income" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      transaction.type === "income"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {transaction.type === "income" ? "+" : ""}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-gray-300">
                {format(new Date(transaction.date), "M/d/yyyy")}
              </TableCell>
              <TableCell>
                {transaction.category ? (
                  <Badge
                    variant="secondary"
                    className="bg-gray-700 text-gray-200 hover:bg-gray-600"
                  >
                    {transaction.category.name}
                  </Badge>
                ) : (
                  <span className="text-gray-500">Без категорії</span>
                )}
              </TableCell>
              <TableCell className="text-gray-300">
                {transaction.description || "Без опису"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
