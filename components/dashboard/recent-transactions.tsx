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
      <CardContent>
        {/* <div className="space-y-4">
          <div className="grid grid-cols-[1fr_100px_100px] items-center gap-4 rounded-lg border p-4">
            <div>
              <div className="font-medium">Магазин продуктів</div>
              <div className="text-sm text-muted-foreground">
                15 квітня 2025
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Badge variant="outline">Їжа</Badge>
            </div>
            <div className="flex items-center justify-end font-medium text-destructive">
              <ArrowDown className="mr-1 h-4 w-4" />
              $85.32
            </div>
          </div>
          <div className="grid grid-cols-[1fr_100px_100px] items-center gap-4 rounded-lg border p-4">
            <div>
              <div className="font-medium">Нарахування зарплати</div>
              <div className="text-sm text-muted-foreground">
                14 квітня 2025
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Badge variant="outline">Доходи</Badge>
            </div>
            <div className="flex items-center justify-end font-medium text-green-600">
              <ArrowUp className="mr-1 h-4 w-4" />
              $2,500.00
            </div>
          </div>
          <div className="grid grid-cols-[1fr_100px_100px] items-center gap-4 rounded-lg border p-4">
            <div>
              <div className="font-medium">Електрика</div>
              <div className="text-sm text-muted-foreground">
                12 квітня 2025
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Badge variant="outline">Послуги</Badge>
            </div>
            <div className="flex items-center justify-end font-medium text-destructive">
              <ArrowDown className="mr-1 h-4 w-4" />
              $78.45
            </div>
          </div>
          <div className="grid grid-cols-[1fr_100px_100px] items-center gap-4 rounded-lg border p-4">
            <div>
              <div className="font-medium">Кофейня</div>
              <div className="text-sm text-muted-foreground">
                10 квітня 2025
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Badge variant="outline">Їжа</Badge>
            </div>
            <div className="flex items-center justify-end font-medium text-destructive">
              <ArrowDown className="mr-1 h-4 w-4" />
              $4.50
            </div>
          </div>
          <div className="grid grid-cols-[1fr_100px_100px] items-center gap-4 rounded-lg border p-4">
            <div>
              <div className="font-medium">Кіно</div>
              <div className="text-sm text-muted-foreground">8 квітня 2025</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Badge variant="outline">Розваги</Badge>
            </div>
            <div className="flex items-center justify-end font-medium text-destructive">
              <ArrowDown className="mr-1 h-4 w-4" />
              $24.00
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
