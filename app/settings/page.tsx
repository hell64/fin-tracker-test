import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
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
