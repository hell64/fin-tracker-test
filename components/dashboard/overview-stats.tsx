"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, DollarSign, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactionStats } from "@/app/actions/transaction";

export function OverviewStats() {
  const [stats, setStats] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function fetchStats() {
  //     try {
  //       const result = await getTransactionStats();
  //       if (result.success) {
  //         const { balance } = result.data;
  //         const totalIncome = Number.parseFloat(balance.total_income);
  //         const totalExpenses = Number.parseFloat(balance.total_expenses);
  //         const savingsRate =
  //           totalIncome > 0
  //             ? ((totalIncome - totalExpenses) / totalIncome) * 100
  //             : 0;

  //         setStats({
  //           balance: Number.parseFloat(balance.balance),
  //           totalIncome,
  //           totalExpenses,
  //           savingsRate,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching stats:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchStats();
  // }, []);

  if (loading) {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Баланс</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
            <p className="text-xs text-muted-foreground mt-2">Loading...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доходи</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
            <p className="text-xs text-muted-foreground mt-2">Loading...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Витрати</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
            <p className="text-xs text-muted-foreground mt-2">Loading...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Споживання</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
            <p className="text-xs text-muted-foreground mt-2">Loading...</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Баланс</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.balance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Ваш поточний баланс</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Доходи</CardTitle>
          <ArrowUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalIncome.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Ваші загальні доходи</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Витрати</CardTitle>
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalExpenses.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Ваші загальні витрати</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Споживання</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.savingsRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Ваші загальні витрати</p>
        </CardContent>
      </Card>
    </>
  );
}
