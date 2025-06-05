"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Get all categories
export async function getCategories() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    // Build where clause
    const where: any = { userId: session.user.id };

    // Get categories
    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("Помилка отримання категорій:", error);
    return { success: false, message: "Помилка отримання категорій:" };
  }
}

// Create category
export async function createCategory(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    const name = formData.get("name") as string;

    // Validate input
    if (!name) {
      return { success: false, message: "Назва є обов'язковою" };
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId: session.user.id,
      },
    });

    if (existingCategory) {
      return {
        success: false,
        message: "Категорія з такою назвою вже існує",
      };
    }

    // Create category
    await prisma.category.create({
      data: {
        name,
        userId: session.user.id,
      },
    });

    revalidatePath("/categories");

    return { success: true, message: "Category created successfully" };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, message: "Failed to create category" };
  }
}

// Update category
export async function updateCategory(id: number, formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    const name = formData.get("name") as string;

    // Validate input
    if (!name) {
      return { success: false, message: "Назва є обов'язковою" };
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCategory) {
      return { success: false, message: "Категорія не знайдена" };
    }

    // Check if name already exists for another category
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name,
        userId: session.user.id,
        id: { not: id },
      },
    });

    if (duplicateCategory) {
      return {
        success: false,
        message: "Категорія з такою назвою вже існує",
      };
    }

    // Update category
    await prisma.category.update({
      where: { id },
      data: {
        name,
      },
    });

    revalidatePath("/categories");

    return { success: true, message: "Категорія оновлена успішно" };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, message: "Не вдалося оновити категорію" };
  }
}

// Delete category
export async function deleteCategory(id: number) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/auth/sign-in");
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/categories");

    return { success: true, message: "Категорія видалена успішно" };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, message: "Не вдалося видалити категорію" };
  }
}
