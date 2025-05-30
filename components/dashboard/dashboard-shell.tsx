import type React from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <div className="flex flex-col gap-6 p-4 ">{children}</div>;
}
