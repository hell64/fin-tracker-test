"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const budgets = [
  {
    id: "1",
    category: "Житло",
    spent: 1200,
    budget: 1500,
    percentage: 80,
  },
  {
    id: "2",
    category: "Їжа",
    spent: 450,
    budget: 500,
    percentage: 90,
  },
  {
    id: "3",
    category: "Транспорт",
    spent: 200,
    budget: 300,
    percentage: 67,
  },
  {
    id: "4",
    category: "Розваги",
    spent: 180,
    budget: 200,
    percentage: 90,
  },
  {
    id: "5",
    category: "Покупки",
    spent: 320,
    budget: 300,
    percentage: 107,
  },
  {
    id: "6",
    category: "Комунальні послуги",
    spent: 150,
    budget: 200,
    percentage: 75,
  },
  {
    id: "7",
    category: "Охорона здоров'я",
    spent: 100,
    budget: 300,
    percentage: 33,
  },
  {
    id: "8",
    category: "Освіта",
    spent: 50,
    budget: 100,
    percentage: 50,
  },
];

export function BudgetsList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => (
        <Card key={budget.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{budget.category}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Відкрити меню</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Редагувати
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Видалити
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  ${budget.spent} of ${budget.budget}
                </div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    budget.percentage > 100 ? "text-destructive" : ""
                  )}
                >
                  {budget.percentage}%
                </div>
              </div>
              <Progress
                value={budget.percentage}
                className={cn(
                  budget.percentage > 100 ? "bg-destructive/20" : "bg-muted",
                  "h-2"
                )}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>Витрачено</div>
                <div>Бюджет</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
