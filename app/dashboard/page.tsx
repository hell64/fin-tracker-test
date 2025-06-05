import Analytics from "@/components/dashboard/stats";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/auth/sign-in");
  }
  const userId = session.user.id;

  return <Analytics userId={userId} />;
}
