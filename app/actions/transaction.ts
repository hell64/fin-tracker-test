"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Get user ID from cookies
async function getUserId() {
  const userId = (await cookies()).get("user_id")?.value;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return Number(userId);
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
    const where: any = { id: session.user.id };

    if (filters.category && filters.category !== "all") {
      where.category_id = Number(filters.category);
    }

    if (filters.type && filters.type !== "all") {
      where.type = filters.type;
    }

    if (filters.startDate) {
      where.date = { ...(where.date || {}), gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.date = { ...(where.date || {}), lte: new Date(filters.endDate) };
    }

    if (filters.search) {
      where.OR = [
        // { description: { contains: filters.search, mode: "insensitive" } },
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
      // category_color: transaction.category?.color,
      // category_icon: transaction.category?.icon,
    }));

    // Get total count for pagination
    const total = await prisma.transaction.count({ where });

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

console.log("sfsdf");

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
        user_id: session.user.id,
      },
      include: {
        category: {
          select: {
            name: true,
            color: true,
            icon: true,
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
      category_name: transaction.category?.name,
      category_color: transaction.category?.color,
      category_icon: transaction.category?.icon,
    };

    return { success: true, data: formattedTransaction };
  } catch (error) {
    console.error("Get transaction error:", error);
    return { success: false, message: "Failed to fetch transaction" };
  }
}

// Create transaction
export async function createTransaction(formData: FormData) {
  try {
    const userId = await getUserId();
    const amount = Number.parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;
    const date = new Date(formData.get("date") as string);
    const categoryId = formData.get("category_id") as string;
    const type = formData.get("type") as string;

    // Validate input
    if (isNaN(amount) || !date || !type) {
      return { success: false, message: "Неправильні дані" };
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        amount,
        description,
        date,
        category_id: categoryId ? Number(categoryId) : null,
        type,
      },
    });

    revalidatePath("/");

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
export async function updateTransaction(id: number, formData: FormData) {
  try {
    const userId = await getUserId();
    const amount = Number.parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;
    const date = new Date(formData.get("date") as string);
    const categoryId = formData.get("category_id") as string;
    const type = formData.get("type") as string;

    // Validate input
    if (isNaN(amount) || !description || !date || !type) {
      return { success: false, message: "Не правильні дані" };
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        user_id: userId,
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
        category_id: categoryId ? Number(categoryId) : null,
        type,
      },
    });

    revalidatePath("/");
    // revalidatePath("/dashboard");

    return { success: true, message: "Транзакція оновлена успішно" };
  } catch (error) {
    console.error("Update transaction error:", error);
    return { success: false, message: "Не вдалося оновити транзакцію" };
  }
}

// Delete transaction
export async function deleteTransaction(id: number) {
  try {
    const userId = await getUserId();

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!existingTransaction) {
      return { success: false, message: "Транзакція не знайдена" };
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/");
    // revalidatePath("/dashboard");

    return { success: true, message: "Транзакція видалена успішно" };
  } catch (error) {
    console.error("Delete transaction error:", error);
    return { success: false, message: "Не вдалося видалити транзакцію" };
  }
}

// Get transaction stats
export async function getTransactionStats() {
  try {
    const userId = getUserId();

    // Get total income
    const incomeResult = await prisma.transaction.aggregate({
      where: {
        user_id: userId,
        type: "income",
      },
      _sum: {
        amount: true,
      },
    });

    // Get total expenses
    const expenseResult = await prisma.transaction.aggregate({
      where: {
        user_id: userId,
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
    const userId = getUserId();
    const currentYear = new Date().getFullYear();

    // Get all transactions for the current year
    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
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
