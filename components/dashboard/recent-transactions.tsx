import { ArrowDown, ArrowUp, Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function RecentTransactions() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Останні транзакції</CardTitle>
            <CardDescription>
              Ваші останні транзакції по всіх рахунках
            </CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Пошук транзакцій..."
              className="w-full appearance-none bg-background pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
