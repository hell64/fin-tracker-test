"use client";

import { CalendarIcon, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { uk } from "date-fns/locale";
import { format } from "date-fns";

export function TransactionFilters({ categories }: { categories: any }) {
  const router = useRouter();
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "all",
  });
  const [date, setDate] = useQueryState("date", {
    defaultValue: new Date().toISOString(),
  });
  const [type, setType] = useQueryState("type", { defaultValue: "all" });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Всі категорії" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі категорії</SelectItem>
          {categories.data.map((category: any) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Всі типи" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Всі типи</SelectItem>
          <SelectItem value="income">Доходи</SelectItem>
          <SelectItem value="expense">Витрати</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: uk }) : "Виберіть дату"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date ? new Date(date) : undefined}
            locale={uk}
            onSelect={(date) => {
              setDate(date?.toISOString() || "");
              router.push(
                `/dashboard/transactions?category=${category}&type=${type}&date=${date}`
              );
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {/* <Button
        variant="outline"
        onClick={() => {
          router.push(
            `/dashboard/transactions?category=${category}&type=${type}&date=${date}`
          );
        }}
      >
        <Filter className="h-4 w-4" />
        Фільтрувати
      </Button> */}
      {/* <Button
        variant="ghost"
        className="ml-auto"
        onClick={() => {
          setCategory("all");
          setDate(new Date().toISOString());
          setType("all");
          // router.push(`/dashboard/transactions?category=all&type=all&date`);
        }}
      >
        Очистити фільтри
      </Button> */}
    </div>
  );
}
