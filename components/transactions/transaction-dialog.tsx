"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  createTransaction,
  updateTransaction,
} from "@/app/actions/transaction-actions";
import { getCategories } from "@/app/actions/category-actions";

interface TransactionDialogProps {
  transaction?: any;
  title?: string;
  description?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function TransactionDialog({
  transaction,
  title = "Додати транзакцію",
  description = "Додайте нову транзакцію до свого облікового запису.",
  onSuccess,
  trigger,
}: TransactionDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<string>(transaction?.type || "expense");
  const [categoryId, setCategoryId] = useState<string>(
    transaction?.category_id?.toString() || ""
  );

  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getCategories(type);
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    if (open) {
      fetchCategories();
    }
  }, [open, type]);

  useEffect(() => {
    if (transaction) {
      setDate(new Date(transaction.date));
      setType(transaction.type);
      setCategoryId(transaction.category_id?.toString() || "");
    }
  }, [transaction]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);

      let result;
      if (transaction) {
        result = await updateTransaction(transaction.id, formData);
      } else {
        result = await createTransaction(formData);
      }

      if (result.success) {
        toast({
          title: "Успіх",
          description: result.message,
        });
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Помилка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Помилка",
        description: "Сталася непередбачена помилка",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Додати транзакцію
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Тип</Label>
              <RadioGroup
                id="type"
                name="type"
                value={type}
                onValueChange={(value) => {
                  setType(value);
                  setCategoryId("");
                }}
                className="flex"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="cursor-pointer">
                    Витрата
                  </Label>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="cursor-pointer">
                    Дохід
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Сума</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={transaction?.amount || ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Опис</Label>
              <Input
                id="description"
                name="description"
                defaultValue={transaction?.description || ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category_id">Категорія</Label>
              <Select
                name="category_id"
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Дата</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <input type="hidden" name="date" value={date.toISOString()} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Примітки</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={transaction?.notes || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {transaction ? "Оновити" : "Додати"} транзакцію
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
