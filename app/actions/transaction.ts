"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export interface TransactionFilters {
  category?: string;
  type?: string;
  date?: string;
  userId: string;
}

export interface FilteredTransaction {
  id: number;
  amount: number;
  type: string;
  description: string | null;
  date: string;
  category: {
    id: number;
    name: string;
  } | null;
}

export interface CategoryOption {
  id: number;
  name: string;
}

export async function calculateTotalAmountByCategory(categoryId: number) {
  const transactions = await prisma.transaction.findMany({
    where: {
      categoryId,
    },
  });

  return transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
}

export async function getFilteredTransactions(
  filters: TransactionFilters
): Promise<FilteredTransaction[]> {
  try {
    const whereClause: any = {
      userId: filters.userId,
    };

    // Filter by category
    if (filters.category && filters.category !== "all") {
      whereClause.categoryId = Number.parseInt(filters.category);
    }

    // Filter by type
    if (filters.type && filters.type !== "all") {
      whereClause.type = filters.type;
    }

    // Filter by date (assuming it's a specific date or date range)
    if (filters.date) {
      const filterDate = new Date(filters.date);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // console.log(66666, transactions);

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      date: transaction.date.toISOString(),
      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error fetching filtered transactions:", error);
    return [];
  }
}

export async function getUserCategories(
  userId: string
): Promise<CategoryOption[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Get transactions with pagination
export async function getTransactions(page = 1, limit = 10, filters: any = {}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = { userId: session.user.id };

    if (filters.category && filters.category !== "all") {
      where.categoryId = Number(filters.category);
    }

    if (filters.type && filters.type !== "all") {
      where.type = filters.type;
    }

    if (filters.date) {
      where.date = { ...(where.date || {}), lte: new Date(filters.date) };
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    });

    // Format transactions for the frontend
    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      category_name: transaction.category?.name,
    }));

    // Get total count for pagination
    const total = await prisma.transaction.count({ where });

    // revalidatePath("/dashboard/transactions");
    // revalidateTag("transactions");

    return {
      success: true,
      data: formattedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get transactions error:", error);
    return {
      success: false,
      message: "Failed to fetch transactions",
      data: [],
      pagination: {
        total: 0,
        limit,
        page,
        totalPages: 0,
      },
    };
  }
}

// Get transaction by ID
export async function getTransactionById(id: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect("/auth/sign-in");
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return { success: false, message: "Transaction not found" };
    }

    // Format transaction for the frontend
    const formattedTransaction = {
      ...transaction,
      category: {
        id: transaction.category?.id,
        name: transaction.category?.name,
      },
    };

    return { success: true, data: formattedTransaction };
  } catch (error) {
    console.error("Get transaction error:", error);
    return { success: false, message: "Failed to fetch transaction" };
  }
}

// Create transaction
export async function createTransaction({
  amount,
  description,
  date,
  categoryId,
  type,
}: {
  amount: number;
  description: string;
  date: Date;
  categoryId: number;
  type: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    // const amount = Number.parseFloat(formData.get("amount") as string);
    // const description = formData.get("description") as string;
    // const date = new Date(formData.get("date") as string);
    // const categoryId = formData.get("categoryId") as string;
    // const type = formData.get("type") as string;

    // Validate input
    if (isNaN(amount) || !date || !type) {
      return { success: false, message: "Неправильні дані" };
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        description,
        date,
        categoryId: categoryId ? Number(categoryId) : null,
        type,
      },
    });

    revalidatePath("/dashboard/transactions");

    return {
      success: true,
      message: "Транзакція створена успішно",
      data: { id: transaction.id },
    };
  } catch (error) {
    console.error("Create transaction error:", error);
    return { success: false, message: "Не вдалося створити транзакцію" };
  }
}

// Update transaction
export async function updateTransaction(
  id: number,
  {
    amount,
    description,
    date,
    categoryId,
    type,
  }: {
    amount: number;
    description: string;
    date: Date;
    categoryId: number;
    type: string;
  }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    // Validate input
    if (isNaN(amount) || !description || !date || !type) {
      return { success: false, message: "Не правильні дані" };
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTransaction) {
      return { success: false, message: "Транзакція не знайдена" };
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        description,
        date,
        categoryId: categoryId ? Number(categoryId) : null,
        type,
      },
    });

    revalidatePath("/transactions");

    return { success: true, message: "Транзакція оновлена успішно" };
  } catch (error) {
    console.error("Update transaction error:", error);
    return { success: false, message: "Не вдалося оновити транзакцію" };
  }
}

// Delete transaction
export async function deleteTransaction(id: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTransaction) {
      return { success: false, message: "Транзакція не знайдена" };
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/transactions");

    return { success: true, message: "Транзакція видалена успішно" };
  } catch (error) {
    console.error("Delete transaction error:", error);
    return { success: false, message: "Не вдалося видалити транзакцію" };
  }
}

// Get transaction stats
export async function getTransactionStats() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    // Get total income
    const incomeResult = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: "income",
      },
      _sum: {
        amount: true,
      },
    });

    // Get total expenses
    const expenseResult = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: "expense",
      },
      _sum: {
        amount: true,
      },
    });

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    return {
      success: true,
      data: {
        balance: {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          balance,
        },
      },
    };
  } catch (error) {
    console.error("Get transaction stats error:", error);
    return {
      success: false,
      message: "Не вдалося отримати статистику транзакцій",
    };
  }
}

// Get monthly spending data for chart
export async function getMonthlySpending() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    const currentYear = new Date().getFullYear();

    // Get all transactions for the current year
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: "expense",
        date: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    // Group transactions by month
    const monthlyData = Array(12)
      .fill(0)
      .map((_, index) => ({
        name: new Date(currentYear, index).toLocaleString("default", {
          month: "short",
        }),
        total: 0,
      }));

    // Sum up transactions for each month
    transactions.forEach((transaction) => {
      const month = transaction.date.getMonth();
      monthlyData[month].total += transaction.amount;
    });

    return {
      success: true,
      data: monthlyData,
    };
  } catch (error) {
    console.error("Get monthly spending error:", error);
    return {
      success: false,
      message: "Не вдалося отримати дані щомісячних витрат",
    };
  }
}
