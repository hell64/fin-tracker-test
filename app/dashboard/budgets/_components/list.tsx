"use client";

import { useToast } from "@/hooks/use-toast";
import { getBudgets, deleteBudget } from "@/app/actions/budget";
import { BudgetDialog } from "./dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

export function BudgetsList() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadBudgets() {
      try {
        const result = await getBudgets();
        if (result.success) {
          setBudgets(result.data || []);
        }
      } catch (error) {
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити бюджети",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadBudgets();
  }, []);

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <div key={budget.id} className="p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{budget.category_name}</h3>
            <div className="flex gap-2">
              <BudgetDialog budget={budget} categories={categories} />
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (confirm("Видалити бюджет?")) {
                    await deleteBudget(budget.id);
                    setBudgets(budgets.filter((b) => b.id !== budget.id));
                  }
                }}
              >
                Видалити
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {budget.period === "monthly"
              ? "Щомісячний"
              : budget.period === "weekly"
              ? "Щотижневий"
              : "Річний"}{" "}
            бюджет: ${budget.amount}
          </div>
          <Progress value={budget.percentage} className="h-2" />
          <div className="flex justify-between text-sm mt-2">
            <span>Витрачено: ${budget.spent}</span>
            <span>
              Залишилось: ${Math.max(0, budget.amount - budget.spent)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
