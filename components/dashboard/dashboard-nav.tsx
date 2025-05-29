"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CreditCard, Home, LogOut, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/app/actions/auth-actions";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span>FinanceTrack</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-start gap-2",
                pathname === "/dashboard" && "bg-muted"
              )}
            >
              <Home className="h-4 w-4" />
              Дашбоард
            </Button>
          </Link>
          <Link href="/transactions">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-start gap-2",
                pathname === "/transactions" && "bg-muted"
              )}
            >
              <CreditCard className="h-4 w-4" />
              Транзакції
            </Button>
          </Link>
          {/* <Link href="/budgets">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-start gap-2",
                pathname === "/budgets" && "bg-muted"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Бюджети
            </Button>
          </Link> */}
          <Link href="/categories">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-start gap-2",
                pathname === "/budgets" && "bg-muted"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Категорії
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-start gap-2",
                pathname === "/settings" && "bg-muted"
              )}
            >
              <Settings className="h-4 w-4" />
              Налаштування
            </Button>
          </Link>
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Вийти
        </Button>
      </div>
    </div>
  );
}
