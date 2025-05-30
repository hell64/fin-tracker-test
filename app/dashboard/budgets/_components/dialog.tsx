"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createBudget, updateBudget } from "@/app/actions/budget";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
// import { BudgetForm } from "./budget-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

const FormSchema = z.object({
  category_id: z.string(),
  amount: z.number(),
  date: z.date(),
  period: z.string(),
});

export function BudgetDialog({
  title = "Додати бюджет",
  budget,
  trigger,
  categories,
}: {
  title?: string;
  budget?: any;
  trigger?: React.ReactNode;
  categories: any[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [period, setPeriod] = useState(budget?.period || "monthly");
  const { toast } = useToast();
  const router = useRouter();
  const [date, setDate] = useState<Date>(
    budget ? new Date(budget.date) : new Date()
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      category_id: budget?.category_id,
      amount: budget?.amount,
      date: budget?.date,
      period: budget?.period,
    },
  });

  // async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  //   event.preventDefault();
  //   const formData = new FormData(event.currentTarget);

  //   try {
  //     if (budget) {
  //       await updateBudget(budget.id, formData);
  //       toast({ title: "Бюджет оновлено" });
  //     } else {
  //       await createBudget(formData);
  //       toast({ title: "Бюджет створено" });
  //     }
  //     setOpen(false);
  //     router.refresh();
  //   } catch (error) {
  //     toast({
  //       title: "Помилка",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   }
  // }

  type BudgetFormValues = z.infer<typeof FormSchema>;

  const onSubmit = async (data: BudgetFormValues) => {
    setIsPending(true);
    // const result = await createBudget({
    //   category_id: data.category_id,
    //   amount: data.amount,
    //   date: data.date,
    //   period: data.period,
    // });

    // if (result.error) {
    //   toast.error(result.error);
    // } else {
    //   toast.success(result.success);
    // }
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Додати бюджет</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{budget ? "Редагувати" : "Створити"} бюджет</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>

        {/* <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category_id">Категорія</Label>
              <Select
                // name="category_id"
                defaultValue={budget?.category_id}
                required
                {...register("category_id")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Сума</Label>
              <Input
                // name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={budget?.amount}
                required
                {...register("amount")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="period">Період</Label>
              <Select
                // name="period"
                value={period}
                onValueChange={setPeriod}
                required
                {...register("period")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Щотижневий</SelectItem>
                  <SelectItem value="monthly">Щомісячний</SelectItem>
                  <SelectItem value="yearly">Річний</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Початок дії</Label>
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
              <input
                type="hidden"
                // name="date"
                value={date.toISOString()}
                {...register("date")}
              />
            </div>
           
          </div>
          <DialogFooter>
            <Button type="submit">Зберегти</Button>
          </DialogFooter>
        </form> */}
        {/* <BudgetForm
          categories={categories}
          initialData={budget}
          currentMonth={budget?.month}
          currentYear={budget?.year}
        /> */}
      </DialogContent>
    </Dialog>
  );
}
