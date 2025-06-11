"use client";

import { useState, useEffect } from "react";
import {
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { getTransactions, deleteTransaction } from "@/app/actions/transaction";
import { TransactionDialog } from "./dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { TransactionContext, useTransactionContext } from "./context";

export function TransactionsList({
  transactions,
  categories,
}: {
  transactions: any;
  categories: any;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 8,
    totalPages: 1,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const { refreshTransactions } = useTransactionContext();

  async function handleDeleteTransaction() {
    if (!transactionToDelete) return;

    try {
      const result = await deleteTransaction(transactionToDelete.id);
      if (result.success) {
        toast({
          title: "Успіх",
          description: result.message,
        });
      } else {
        toast({
          title: "Помилка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося видалити транзакцію",
        variant: "destructive",
      });
    } finally {
      await refreshTransactions();
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  }

  function confirmDelete(transaction: any) {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Сума</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Категорія</TableHead>
              <TableHead>Опис</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Жодної транзакції не знайдено. Додайте свою першу транзакцію,
                  щоб почати.
                </TableCell>
              </TableRow>
            ) : (
              transactions.data.map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell
                    className={`font-medium ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <div className="flex items-center ">
                        <ArrowUp className="mr-1 h-4 w-4" />
                        {Math.abs(
                          Number.parseFloat(transaction.amount)
                        ).toFixed(2)}{" "}
                        {transaction.currency}
                      </div>
                    ) : (
                      <div className="flex items-center ">
                        <ArrowDown className="mr-1 h-4 w-4" />
                        {Math.abs(
                          Number.parseFloat(transaction.amount)
                        ).toFixed(2)}{" "}
                        {transaction.currency}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.category_name || "Без категорії"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Відкрити меню</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <TransactionDialog
                          transaction={transaction}
                          categories={categories}
                          title="Редагувати транзакцію"
                          description="Оновіть деталі цієї транзакції."
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Редагувати
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => confirmDelete(transaction)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Видалити
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < pagination.totalPages) setPage(page + 1);
                }}
                className={
                  page === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Ця дія не може бути відмінена. Це видалить транзакцію назавжди.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive text-destructive-foreground"
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
