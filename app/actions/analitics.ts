"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface BudgetData {
  category: string;
  budget: number;
  actual: number;
  period: string;
}

export interface TransactionData {
  id: number;
  description: string | null;
  amount: number;
  type: string;
  category: string | null;
  date: string;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export async function getMonthlyData(userId: string): Promise<MonthlyData[]> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    // Group by month
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const monthKey = transaction.date.toLocaleDateString("uk-UA", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      if (transaction.type === "income") {
        monthData.income += transaction.amount;
      } else {
        monthData.expense += Math.abs(transaction.amount);
      }
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    return [];
  }
}

export async function getCategoryData(userId: string): Promise<CategoryData[]> {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    const categoryExpenses = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: "expense",
        date: {
          gte: oneMonthAgo,
        },
        category: {
          isNot: null,
        },
      },
      include: {
        category: true,
      },
    });

    const categoryMap = new Map<string, number>();

    categoryExpenses.forEach((transaction) => {
      const categoryName = transaction.category?.name || "Інше";
      const currentAmount = categoryMap.get(categoryName) || 0;
      categoryMap.set(
        categoryName,
        currentAmount + Math.abs(transaction.amount)
      );
    });

    console.log(categoryMap);

    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];

    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  } catch (error) {
    console.error("Error fetching category data:", error);
    return [];
  }
}

export async function getBudgetData(userId: string): Promise<BudgetData[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        period: "monthly",
        startDate: {
          lte: endOfMonth,
        },
        OR: [{ endDate: null }, { endDate: { gte: startOfMonth } }],
      },
      include: {
        category: true,
      },
    });

    const budgetDataPromises = budgets.map(async (budget) => {
      const actualExpenses = await prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          categoryId: budget.categoryId,
          type: "expense",
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        category: budget.category.name,
        budget: budget.amount,
        actual: Math.abs(actualExpenses._sum.amount || 0),
        period: budget.period,
      };
    });

    return await Promise.all(budgetDataPromises);
  } catch (error) {
    console.error("Error fetching budget data:", error);
    return [];
  }
}

export async function getRecentTransactions(
  userId: string
): Promise<TransactionData[]> {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category?.name || null,
      date: transaction.date.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

export async function getSummaryData(userId: string): Promise<SummaryData> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    const [incomeResult, expenseResult, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "income",
          date: {
            gte: sixMonthsAgo,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "expense",
          date: {
            gte: sixMonthsAgo,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.count({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = Math.abs(expenseResult._sum.amount || 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount,
    };
  } catch (error) {
    console.error("Error fetching summary data:", error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: 0,
    };
  }
}
