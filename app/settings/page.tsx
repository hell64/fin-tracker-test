import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsTabs } from "@/app/settings/_components/tabs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Налаштування"
        text="Керуйте своїми налаштуваннями та перевагами облікового запису."
      />
      <SettingsTabs />
    </DashboardShell>
  );
}
