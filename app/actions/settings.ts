"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function updateCurrency(currency: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  if (!user) {
    return { error: "User not found" };
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      currency,
    },
  });
  revalidatePath("/dashboard/settings");
  if (updatedUser) {
    return { success: "Валюта успішно змінена" };
  }
  return { error: "Failed to update currency" };
}
