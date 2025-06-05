import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Дашборд",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Транзакції",
    url: "/dashboard/transactions",
    icon: Inbox,
  },
  {
    title: "Бюджети",
    url: "/dashboard/budgets",
    icon: Inbox,
  },
  {
    title: "Категорії",
    url: "/dashboard/categories",
    icon: Inbox,
  },
  {
    title: "Налаштування",
    url: "/dashboard/settings",
    icon: Inbox,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader className="text-2xl font-bold px-6">
          FinanceTrack
        </SidebarHeader>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Меню</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
