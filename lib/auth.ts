import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function getUser() {
  const userId = (await cookies()).get("user_id")?.value;

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
