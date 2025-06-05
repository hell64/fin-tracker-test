import {
  UpdateAvatarCard,
  UpdateNameCard,
  UpdateUsernameCard,
  ChangeEmailCard,
  ChangePasswordCard,
  ProvidersCard,
  SessionsCard,
  DeleteAccountCard,
  UpdateFieldCard,
} from "@daveyplate/better-auth-ui";

import { ChangeCurrencyCard } from "./_components/currency-card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function CustomSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/auth/sign-in");
  }
  const userCurrency = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      currency: true,
    },
  });
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-12 px-4">
      <UpdateNameCard />

      <ChangeCurrencyCard currency={userCurrency?.currency} />

      <ChangePasswordCard />

      <SessionsCard />

      <DeleteAccountCard />
    </div>
  );
}
