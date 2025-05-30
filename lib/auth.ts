// import { cookies } from "next/headers";
// import prisma from "@/lib/prisma";

// export async function getUser() {
//   const userId = (await cookies()).get("user_id")?.value;

//   if (!userId) {
//     return null;
//   }

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: Number(userId) },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//       },
//     });

//     return user;
//   } catch (error) {
//     console.error("Get user error:", error);
//     return null;
//   }
// }

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
});
