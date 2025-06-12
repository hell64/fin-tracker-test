"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type BudgetSpent = {
  budgetId: number;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  spentPercentage: number;
  categoryName: string;
  period: string;
  startDate: Date;
  endDate: Date | null;
};

export type UserTransactionSummary = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  currency: string;
};

export type CategorySpending = {
  categoryId: number;
  categoryName: string;
  totalSpent: number;
  transactionCount: number;
};

// Validation schemas
const CreateBudgetSchema = z
  .object({
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    period: z.enum(["weekly", "monthly", "yearly"], {
      errorMap: () => ({ message: "Please select a valid period" }),
    }),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    categoryId: z.coerce.number().min(1, "Please select a category"),
  })
  .refine(
    (data) => {
      if (data.endDate && data.endDate <= data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

// Create Budget
export async function createBudget({
  amount,
  period,
  startDate,
  endDate,
  categoryId,
}: {
  amount: number;
  period: string;
  startDate: Date;
  endDate: Date;
  categoryId: string;
}): Promise<any> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  try {
    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: Number(categoryId),
        userId: session.user.id,
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Категорія не знайдена",
      };
    }

    // Check for overlapping budgets in same category and period
    const overlappingBudget = await prisma.budget.findFirst({
      where: {
        categoryId: Number(categoryId),
        userId: session.user.id,
        period,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              {
                OR: [{ endDate: { gte: startDate } }, { endDate: null }],
              },
            ],
          },
          ...(endDate
            ? [
                {
                  AND: [
                    { startDate: { lte: endDate } },
                    {
                      OR: [{ endDate: { gte: endDate } }, { endDate: null }],
                    },
                  ],
                },
              ]
            : []),
        ],
      },
    });

    if (overlappingBudget) {
      return {
        success: true,
        message:
          "Бюджет для цієї категорії та періоду вже існує в вибраному діапазоні дат",
      };
    }

    await prisma.budget.create({
      data: {
        amount,
        period,
        startDate,
        endDate,
        categoryId: Number(categoryId),
        userId: session.user.id,
      },
    });

    revalidatePath("/budgets");
    return { success: true, message: "Бюджет створений успішно" };
  } catch (error) {
    console.error("Create budget error:", error);
    return { success: false, message: "Не вдалося створити бюджет" };
  }
}

// Get Budgets
export async function getBudgets() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
      },
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      data: budgets,
    };
  } catch (error) {
    return { success: false, message: "Не вдалося завантажити бюджети" };
  }
}

// Get Current Budgets (active budgets for current date)
export async function getCurrentBudgets() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const now = new Date();

  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        startDate: { lte: now },
        OR: [{ endDate: { gte: now } }, { endDate: null }],
      },
      include: {
        category: true,
      },
      orderBy: {
        category: { name: "asc" },
      },
    });

    return budgets;
  } catch (error) {
    return [];
  }
}

// Get Budget by ID
export async function getBudgetById(id: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  try {
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    return budget;
  } catch (error) {
    return null;
  }
}

// Get Budgets by Category
export async function getBudgetsByCategory(categoryId: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  try {
    const budgets = await prisma.budget.findMany({
      where: {
        categoryId,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return budgets;
  } catch (error) {
    return [];
  }
}

// Update Budget
export async function updateBudget(
  id: number,
  {
    amount,
    period,
    startDate,
    endDate,
    categoryId,
  }: {
    amount: number;
    period: string;
    startDate: Date;
    endDate: Date;
    categoryId: number;
  }
): Promise<any> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  // const validatedFields = UpdateBudgetSchema.safeParse({
  //   id: Number(formData.get("id")),
  //   amount: formData.get("amount"),
  //   period: formData.get("period"),
  //   startDate: formData.get("startDate"),
  //   endDate: formData.get("endDate") || undefined,
  //   categoryId: formData.get("categoryId"),
  // });

  // if (!validatedFields.success) {
  //   return {
  //     errors: validatedFields.error.flatten().fieldErrors,
  //   };
  // }

  // const { id, amount, period, startDate, endDate, categoryId } =
  //   validatedFields.data;

  try {
    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingBudget) {
      return {
        success: false,
        message: "Бюджет не знайдений",
      };
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: Number(categoryId),
        userId: session.user.id,
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Категорія не знайдена",
      };
    }

    // Check for overlapping budgets (excluding current budget)
    const overlappingBudget = await prisma.budget.findFirst({
      where: {
        id: { not: id },
        categoryId: Number(categoryId),
        userId: session.user.id,
        period,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              {
                OR: [{ endDate: { gte: startDate } }, { endDate: null }],
              },
            ],
          },
          ...(endDate
            ? [
                {
                  AND: [
                    { startDate: { lte: endDate } },
                    {
                      OR: [{ endDate: { gte: endDate } }, { endDate: null }],
                    },
                  ],
                },
              ]
            : []),
        ],
      },
    });

    if (overlappingBudget) {
      return {
        success: false,
        message:
          "Бюджет для цієї категорії та періоду вже існує в вибраному діапазоні дат",
      };
    }

    await prisma.budget.update({
      where: { id },
      data: {
        amount,
        period,
        startDate,
        endDate,
        categoryId: Number(categoryId),
      },
    });

    revalidatePath("/budgets");
    return { success: true, message: "Бюджет оновлений успішно" };
  } catch (error) {
    console.error("Update budget error:", error);
    return {
      success: false,
      message: "Не вдалося оновити бюджет",
    };
  }
}

// Delete Budget
export async function deleteBudget(id: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  try {
    // Check if budget exists and belongs to user
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!budget) {
      throw new Error("Budget not found");
    }

    await prisma.budget.delete({
      where: { id },
    });

    revalidatePath("/categories");
    revalidatePath("/budgets");
    revalidatePath("/transactions");

    return { success: true, message: "Бюджет видалений успішно" };
  } catch (error) {
    console.error("Delete budget error:", error);
    return { success: false, message: "Не вдалося видалити бюджет" };
  }
}

export async function calculateTotalAmountByCategory() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const category = await prisma.category.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      transactions: true,
    },
  });

  // const allSpendingInCategory = category?.transactions.reduce(
  //   (acc, transaction) => {
  //     return acc + transaction.amount;
  //   },
  //   0
  // );

  const allSpendingInCategory = category?.transactions.reduce(
    (acc, transaction) => {
      return acc + transaction.amount;
    },
    0
  );

  console.log(999999, allSpendingInCategory);

  return {
    categories: category?.transactions.map((transaction) => ({
      // id: transaction.id,
      name: category?.name,
      spending: transaction.amount,
    })),
  };
}

/**
 * Вираховує суму витрачених коштів для всіх бюджетів користувача
 * Аналогія: як рахівник, який перевіряє кожну "кишеню" (бюджет)
 * і підраховує скільки з неї витратили
 */
export const getBudgetSpentAnalysis = async (): Promise<BudgetSpent[]> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    include: {
      category: true,
      user: {
        select: { currency: true },
      },
    },
  });

  // Для кожного бюджету рахуємо витрачену суму через транзакції
  const budgetAnalysis = await Promise.all(
    budgets.map(async (budget) => {
      // Знаходимо всі витратні транзакції в межах періоду бюджету
      const spentAmount = await prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          categoryId: budget.categoryId,
          type: "expense",
          date: {
            gte: budget.startDate,
            ...(budget.endDate && { lte: budget.endDate }),
          },
        },
        _sum: {
          amount: true,
        },
      });

      const spent = spentAmount._sum.amount || 0;
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        budgetId: budget.id,
        budgetAmount: budget.amount,
        spentAmount: spent,
        remainingAmount: remaining,
        spentPercentage: Math.round(percentage * 100) / 100,
        categoryName: budget.category.name,
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
      };
    })
  );

  return budgetAnalysis;
};

/**
 * Отримує загальну суму всіх транзакцій користувача
 * Аналогія: як банківська виписка - показує всі надходження та витрати
 */
export const getUserTransactionSummary = async (
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<UserTransactionSummary> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const whereClause = {
    userId,
    ...(dateFrom &&
      dateTo && {
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      }),
  };

  // Паралельно отримуємо доходи та витрати
  const [incomeData, expenseData, transactionCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...whereClause, type: "income" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...whereClause, type: "expense" },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: whereClause,
    }),
  ]);

  const totalIncome = incomeData._sum.amount || 0;
  const totalExpenses = expenseData._sum.amount || 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    transactionCount,
    currency: user.currency || "UAH",
  };
};

/**
 * Отримує витрати по категоріях для користувача
 * Корисно для аналізу на що найбільше витрачають
 */
export const getCategorySpendingAnalysis = async (
  userId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<CategorySpending[]> => {
  const whereClause = {
    userId,
    type: "expense" as const,
    categoryId: { not: null },
    ...(dateFrom &&
      dateTo && {
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      }),
  };

  const categorySpending = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: whereClause,
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  // Отримуємо назви категорій
  const categoriesData = await prisma.category.findMany({
    where: {
      id: { in: categorySpending.map((cs) => cs.categoryId!).filter(Boolean) },
    },
    select: { id: true, name: true },
  });

  const categoryMap = new Map(categoriesData.map((cat) => [cat.id, cat.name]));

  return categorySpending
    .map((spending) => ({
      categoryId: spending.categoryId!,
      categoryName: categoryMap.get(spending.categoryId!) || "Unknown",
      totalSpent: spending._sum.amount || 0,
      transactionCount: spending._count.id,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent); // Сортуємо за сумою витрат
};

/**
 * Перевіряє чи перевищені бюджети
 * Аналогія: система попереджень, як сигналізація в машині
 */
export const getOverspentBudgets = async (userId: string) => {
  const budgetAnalysis = await getBudgetSpentAnalysis(userId);

  return budgetAnalysis
    .filter((budget) => budget.spentAmount > budget.budgetAmount)
    .map((budget) => ({
      ...budget,
      overspentAmount: budget.spentAmount - budget.budgetAmount,
    }));
};

/**
 * Отримує активні бюджети (ті що ще не закінчились)
 */
export const getActiveBudgets = async (userId: string) => {
  const now = new Date();

  return prisma.budget.findMany({
    where: {
      userId,
      OR: [
        { endDate: null }, // Бюджети без кінцевої дати
        { endDate: { gte: now } }, // Бюджети що ще не закінчились
      ],
    },
    include: {
      category: true,
    },
    orderBy: {
      startDate: "desc",
    },
  });
};

/**
 * Server Action для Next.js - отримання аналітики бюджетів
 */
export const getBudgetAnalyticsAction = async (userId: string) => {
  "use server";

  try {
    const [
      budgetSpent,
      transactionSummary,
      categorySpending,
      overspentBudgets,
    ] = await Promise.all([
      getBudgetSpentAnalysis(userId),
      getUserTransactionSummary(userId),
      getCategorySpendingAnalysis(userId),
      getOverspentBudgets(userId),
    ]);

    return {
      success: true,
      data: {
        budgetSpent,
        transactionSummary,
        categorySpending,
        overspentBudgets,
      },
    };
  } catch (error) {
    console.error("Error fetching budget analytics:", error);
    return {
      success: false,
      error: "Failed to fetch budget analytics",
    };
  }
};
