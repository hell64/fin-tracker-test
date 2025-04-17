"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

// Register a new user
export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    // Validate input
    if (!name || !email || !password) {
      return { success: false, message: "Всі поля є обов'язковими" };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Паролі не співпадають" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "Користувач з таким email вже існує" };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
      },
    });

    // Create default categories for the user
    await createDefaultCategories(user.id);

    // Create session
    const sessionToken = uuidv4();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session in a secure HTTP-only cookie
    cookies().set({
      name: "session_token",
      value: sessionToken,
      expires,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Store user ID in a cookie for client access
    cookies().set({
      name: "user_id",
      value: user.id.toString(),
      expires,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return { success: true, message: "Registration successful" };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Сталася помилка під час реєстрації" };
  }
}

// Login user
export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input
    if (!email || !password) {
      return { success: false, message: "Email і пароль є обов'язковими" };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "Неправильний email або пароль" };
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return { success: false, message: "Неправильний email або пароль" };
    }

    // Create session
    const sessionToken = uuidv4();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session in a secure HTTP-only cookie
    cookies().set({
      name: "session_token",
      value: sessionToken,
      expires,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Store user ID in a cookie for client access
    cookies().set({
      name: "user_id",
      value: user.id.toString(),
      expires,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return { success: true, message: "Успішний вхід" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Сталася помилка під час входу" };
  }
}

// Logout user
export async function logoutUser() {
  cookies().delete("session_token");
  cookies().delete("user_id");
  redirect("/login");
}

// Get current user
export async function getUser() {
  const userId = cookies().get("user_id")?.value;

  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

// Create default categories for a new user
async function createDefaultCategories(userId: number) {
  const defaultExpenseCategories = [
    { name: "Їжа", color: "#4CAF50", icon: "utensils" },
    { name: "Транспорт", color: "#2196F3", icon: "car" },
    { name: "Житло", color: "#9C27B0", icon: "home" },
    { name: "Комунальні послуги", color: "#FF9800", icon: "bolt" },
    { name: "Розваги", color: "#E91E63", icon: "film" },
    { name: "Покупки", color: "#00BCD4", icon: "shopping-bag" },
    { name: "Охорона здоров'я", color: "#F44336", icon: "heart" },
    { name: "Освіта", color: "#3F51B5", icon: "book" },
  ];

  const defaultIncomeCategories = [
    { name: "Зарплата", color: "#4CAF50", icon: "briefcase" },
    { name: "Фріланс", color: "#2196F3", icon: "laptop" },
    { name: "Інвестиції", color: "#9C27B0", icon: "chart-line" },
    { name: "Подарунки", color: "#FF9800", icon: "gift" },
  ];

  // Insert expense categories
  for (const category of defaultExpenseCategories) {
    await prisma.category.create({
      data: {
        name: category.name,
        type: "expense",
        color: category.color,
        icon: category.icon,
        user_id: userId,
        is_default: true,
      },
    });
  }

  // Insert income categories
  for (const category of defaultIncomeCategories) {
    await prisma.category.create({
      data: {
        name: category.name,
        type: "income",
        color: category.color,
        icon: category.icon,
        user_id: userId,
        is_default: true,
      },
    });
  }
}
