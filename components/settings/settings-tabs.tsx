"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Globe, Moon, Palette, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const currencies = [
  { label: "US Dollar (USD)", value: "usd" },
  { label: "Euro (EUR)", value: "eur" },
  { label: "Ukrainian Hryvnia (UAH)", value: "uah" },
];

export function SettingsTabs() {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("usd");

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="general">Основні</TabsTrigger>
        <TabsTrigger value="appearance">Внесення</TabsTrigger>
        <TabsTrigger value="export">Виведення</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Основні налаштування</CardTitle>
            <CardDescription>
              Керуйте своїми налаштуваннями та перевагами облікового запису.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Ім'я</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Електронна пошта</Label>
              <Input
                id="email"
                defaultValue="john.doe@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Валюта</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {currencies.find((c) => c.value === currency)?.label ||
                      "Select currency..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Пошук валюти..." />
                    <CommandList>
                      <CommandEmpty>Валюта не знайдена.</CommandEmpty>
                      <CommandGroup>
                        {currencies.map((c) => (
                          <CommandItem
                            key={c.value}
                            value={c.value}
                            onSelect={(currentValue) => {
                              setCurrency(currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                currency === c.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {c.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Зберегти зміни</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Внесення</CardTitle>
            <CardDescription>Налаштуйте внесення та категорії.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Тема</Label>
              <div className="flex gap-4">
                <Button variant="outline" className="w-full justify-start">
                  <Sun className="mr-2 h-4 w-4" />
                  Світла
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Moon className="mr-2 h-4 w-4" />
                  Темна
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Системна
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Акцент</Label>
              <div className="flex gap-4">
                <Button variant="outline" className="w-full justify-start">
                  <Palette className="mr-2 h-4 w-4" />
                  Стандартна
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600"
                >
                  <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                  Зелена
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 hover:text-purple-600"
                >
                  <div className="mr-2 h-4 w-4 rounded-full bg-purple-500" />
                  Фіолетова
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Зберегти зміни</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="export">
        <Card>
          <CardHeader>
            <CardTitle>Виведення</CardTitle>
            <CardDescription>
              Виведіть свої фінансові дані у різних форматах.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Формат виведення</Label>
              <div className="flex gap-4">
                <Button variant="outline" className="w-full justify-start">
                  CSV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Excel
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Діапазон дат</Label>
              <div className="flex gap-4">
                <Button variant="outline" className="w-full justify-start">
                  Цей місяць
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Останні 3 місяці
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Цей рік
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Всі часи
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Вивести дані</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
