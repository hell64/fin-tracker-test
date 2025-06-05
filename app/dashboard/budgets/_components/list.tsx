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
import { BudgetDialog } from "./dialog";
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
import { Dialog } from "@/components/ui/dialog";
import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { deleteCategory } from "@/app/actions/category";
import { deleteBudget } from "@/app/actions/budget";
import { Progress } from "@/components/ui/progress";
// import { Category } from "@/app/types/category";

export function BudgetsList({
  budgets,
  categories,
  spent,
}: {
  budgets: any;
  categories: any;
  spent: any;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 8,
    totalPages: 1,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  async function handleDeleteBudget() {
    if (!budgetToDelete) return;

    try {
      const result = await deleteBudget(budgetToDelete.id);
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
      setDeleteDialogOpen(false);
      setBudgetToDelete(null);
    }
  }

  function confirmDelete(budget: any) {
    setBudgetToDelete(budget);
    setDeleteDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {budgets.data?.map((budget: any) => (
        <Card key={budget.id} className="w-full border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{budget.category.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{budget.period}</Badge>
                <Badge variant="outline">{budget.amount}</Badge>
                {/* <Badge variant="outline">
                  {budget.startDate.toLocaleDateString("uk-UA")}
                </Badge>
                <Badge variant="outline">
                  {budget.endDate?.toLocaleDateString("uk-UA")}
                </Badge> */}
              </div>
              <Progress
                value={budget.amount / budget.category.spent}
                className="w-[60%]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Відкрити меню</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <BudgetDialog
                    budget={budget}
                    title="Редагувати бюджет"
                    description="Оновіть бюджет."
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Редагувати
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={() => confirmDelete(budget)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Видалити
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}

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
              onClick={handleDeleteBudget}
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
