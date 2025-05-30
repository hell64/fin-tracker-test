"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

// Get user ID from cookies
async function getUserId() {
  const userId = (await cookies()).get("user_id")?.value;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return Number(userId);
}

// Get all budgets
export async function getBudgets() {
  try {
    const userId = await getUserId();

    // Get budgets with category information
    const budgets = await prisma.budget.findMany({
      where: {
        user_id: userId,
      },
      include: {
        category: {
          select: {
            name: true,
            // color: true,
            // icon: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        // Determine date range based on budget period
        let startDate, endDate;

        if (budget.period === "monthly") {
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (budget.period === "yearly") {
          const now = new Date();
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
        } else {
          // weekly
          const now = new Date();
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
          startDate = new Date(now.getFullYear(), now.getMonth(), diff);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
        }

        // Get spending for this category in the date range
        const spending = await prisma.transaction.aggregate({
          where: {
            user_id: userId,
            category_id: budget.category_id,
            type: "expense",
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spent = spending._sum.amount || 0;
        const percentage =
          budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

        return {
          ...budget,
          category_name: budget.category.name,
          // category_color: budget.category.color,
          // category_icon: budget.category.icon,
          spent,
          percentage,
        };
      })
    );

    return {
      success: true,
      data: budgetsWithSpending,
    };
  } catch (error) {
    console.error("Get budgets error:", error);
    return { success: false, message: "Failed to fetch budgets" };
  }
}

// Create budget
export async function createBudget(formData: FormData) {
  try {
    const userId = await getUserId();
    const categoryId = Number(formData.get("category_id") as string);
    const amount = Number.parseFloat(formData.get("amount") as string);
    const period = formData.get("period") as string;
    const startDate = new Date(formData.get("start_date") as string);
    const endDateStr = formData.get("end_date") as string;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    // Validate input
    if (isNaN(categoryId) || isNaN(amount) || !period || !startDate) {
      return { success: false, message: "Invalid input data" };
    }

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        user_id: userId,
      },
    });

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Check if budget already exists for this category
    const existingBudget = await prisma.budget.findFirst({
      where: {
        user_id: userId,
        category_id: categoryId,
      },
    });

    if (existingBudget) {
      return {
        success: false,
        message: "A budget already exists for this category",
      };
    }

    // Create budget
    await prisma.budget.create({
      data: {
        user_id: userId,
        category_id: categoryId,
        amount,
        period,
        start_date: startDate,
        end_date: endDate,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return { success: true, message: "Budget created successfully" };
  } catch (error) {
    console.error("Create budget error:", error);
    return { success: false, message: "Failed to create budget" };
  }
}

// Update budget
export async function updateBudget(id: number, formData: FormData) {
  try {
    const userId = await getUserId();
    const amount = Number.parseFloat(formData.get("amount") as string);
    const period = formData.get("period") as string;
    const startDate = new Date(formData.get("start_date") as string);
    const endDateStr = formData.get("end_date") as string;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    // Validate input
    if (isNaN(amount) || !period || !startDate) {
      return { success: false, message: "Invalid input data" };
    }

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!existingBudget) {
      return { success: false, message: "Budget not found" };
    }

    // Update budget
    await prisma.budget.update({
      where: { id },
      data: {
        amount,
        period,
        start_date: startDate,
        end_date: endDate,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return { success: true, message: "Бюджет оновлено успішно" };
  } catch (error) {
    console.error("Update budget error:", error);
    return { success: false, message: "Не вдалося оновити бюджет" };
  }
}

// Delete budget
export async function deleteBudget(id: number) {
  try {
    const userId = await getUserId();

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!existingBudget) {
      return { success: false, message: "Budget not found" };
    }

    // Delete budget
    await prisma.budget.delete({
      where: { id },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return { success: true, message: "Бюджет видалено успішно" };
  } catch (error) {
    console.error("Delete budget error:", error);
    return { success: false, message: "Не вдалося видалити бюджет" };
  }
}
