import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { getCategories } from "../actions/category-actions";
import { CategoriesList } from "@/components/categories/categories-list";
import { CategoriesDialog } from "@/components/categories/categories-dialog";

// const categories = [
//   {
//     id: "1",
//     category: "Житло",
//     spent: 1200,
//     budget: 1500,
//     percentage: 80,
//   },
//   {
//     id: "2",
//     category: "Їжа",
//     spent: 450,
//     budget: 500,
//     percentage: 90,
//   },
//   {
//     id: "3",
//     category: "Транспорт",
//     spent: 200,
//     budget: 300,
//     percentage: 67,
//   },
//   {
//     id: "4",
//     category: "Розваги",
//     spent: 180,
//     budget: 200,
//     percentage: 90,
//   },
//   {
//     id: "5",
//     category: "Покупки",
//     spent: 320,
//     budget: 300,
//     percentage: 107,
//   },
//   {
//     id: "6",
//     category: "Комунальні послуги",
//     spent: 150,
//     budget: 200,
//     percentage: 75,
//   },
//   {
//     id: "7",
//     category: "Охорона здоров'я",
//     spent: 100,
//     budget: 300,
//     percentage: 33,
//   },
//   {
//     id: "8",
//     category: "Освіта",
//     spent: 50,
//     budget: 100,
//     percentage: 50,
//   },
// ];

export default async function CategoriesPage() {
  const user = await getUser();

  const categories = await getCategories();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Категорії" text="Керуйте своїми категоріями.">
        <CategoriesDialog />
      </DashboardHeader>
      <CategoriesList categories={categories} />
    </DashboardShell>
  );
}
