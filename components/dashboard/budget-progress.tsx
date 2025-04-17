"use client";

import { useEffect, useState } from "react";
import type { HTMLAttributes } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getBudgets } from "@/app/actions/budget-actions";

interface BudgetProgressProps extends HTMLAttributes<HTMLDivElement> {}

export function BudgetProgress({ className, ...props }: BudgetProgressProps) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const result = await getBudgets();
        if (result.success) {
          setBudgets(result.data.slice(0, 5)); // Show only top 5 budgets
        }
      } catch (error) {
        console.error("Error fetching budgets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgets();
  }, []);

  return (
    <Card className={cn(className)} {...props}>
      <CardHeader>
        <CardTitle>Прогрес бюджету</CardTitle>
        <CardDescription>Ваші щомісячні бюджети за категоріями</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                  </div>
                  <div className="h-2 animate-pulse rounded bg-muted"></div>
                </div>
              ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Жодного бюджету не знайдено. Створіть свій перший бюджет для
            відстеження своїх витрат.
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{budget.category_name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${budget.spent.toFixed(2)} / $
                    {Number.parseFloat(budget.amount).toFixed(2)}
                  </div>
                </div>
                <Progress
                  value={budget.percentage}
                  className={cn(
                    budget.percentage > 100 ? "bg-destructive/20" : "bg-muted",
                    "h-2"
                  )}
                  indicatorClassName={
                    budget.percentage > 100 ? "bg-destructive" : ""
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
