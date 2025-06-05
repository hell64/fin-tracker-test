"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

// const UpdateBudgetSchema = z
//   .object({
//     id: z.number(),
//     amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
//     period: z.enum(["weekly", "monthly", "yearly"], {
//       errorMap: () => ({ message: "Please select a valid period" }),
//     }),
//     startDate: z.coerce.date(),
//     endDate: z.coerce.date().optional(),
//     categoryId: z.coerce.number().min(1, "Please select a category"),
//   })
//   .refine(
//     (data) => {
//       if (data.endDate && data.endDate <= data.startDate) {
//         return false;
//       }
//       return true;
//     },
//     {
//       message: "End date must be after start date",
//       path: ["endDate"],
//     }
//   );

// Types
// type BudgetFormState = {
//   errors?: {
//     amount?: string[];
//     period?: string[];
//     startDate?: string[];
//     endDate?: string[];
//     categoryId?: string[];
//     _form?: string[];
//   };
//   success?: boolean;
// };

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

  // const validatedFields = CreateBudgetSchema.safeParse({
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

  // const { amount, period, startDate, endDate, categoryId } =
  //   validatedFields.data;

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
    // const spent = await prisma.transaction.aggregate({
    //   where: {
    //     userId: session.user.id,
    //     type: "expense",
    //     date: {
    //       gte: new Date(new Date().setDate(new Date().getDate() - 30)),
    //       lte: new Date(),
    //     },
    //   },
    //   _sum: { amount: true },
    // });

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
