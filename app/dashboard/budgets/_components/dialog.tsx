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
} from "@/app/actions/transaction";
import { uk } from "date-fns/locale";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { createBudget, updateBudget } from "@/app/actions/budget";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.join(", ")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export function BudgetDialog({
  budget,
  categories,
  title = "Додати бюджет",
  description = "Додайте новий бюджет.",
  trigger,
}: any) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      amount: budget?.amount || "",
      period: budget?.period || "monthly",
      startDate: budget?.startDate || new Date(),
      endDate: budget?.endDate || undefined,
      categoryId: budget?.categoryId || "",
    },
    onSubmit: async ({ value }) => {
      let result;
      if (budget) {
        result = await updateBudget(budget.id, value);
      } else {
        result = await createBudget(value);
      }
      if (result.success) {
        setOpen(false);
        toast({
          title: "Успіх",
          // description: result.message,
        });
      } else {
        toast({
          title: "Помилка",
          // description: result.message,
          variant: "destructive",
        });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Додати бюджет
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-4">
            <form.Field
              name="period"
              validators={{
                // We can choose between form-wide and field-specific validators
                onChange: ({ value }) =>
                  value === "monthly" ||
                  value === "weekly" ||
                  value === "yearly"
                    ? undefined
                    : "Must be monthly, weekly or yearly",
              }}
              children={(field) => (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="period">Період</Label>
                    <RadioGroup
                      id="period"
                      name="period"
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                      }}
                      className="flex"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="cursor-pointer">
                          Щомісячний
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="cursor-pointer">
                          Щотижневий
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <RadioGroupItem value="yearly" id="yearly" />
                        <Label htmlFor="yearly" className="cursor-pointer">
                          Річний
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {!field.state.meta.isValid && (
                    <em>{field.state.meta.errors.join(",")}</em>
                  )}
                </>
              )}
            />

            <div className="grid gap-2">
              <form.Field
                name="amount"
                children={(field) => (
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    type="number"
                    step="0.01"
                    min="0"
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                  />
                )}
              />
            </div>

            {/* <div className="grid gap-2">
              <form.Field
                name="categoryId"
                children={(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.data.map((category: any) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div> */}
            <div className="grid gap-2">
              <form.Field
                name="startDate"
                children={(field) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !field.state.value && "text-muted-foreground"
                        )}
                      >
                        {field.state.value
                          ? format(field.state.value, "PPP", { locale: uk })
                          : "Виберіть дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.state.value}
                        onSelect={(date) => field.handleChange(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <form.Field
              name="categoryId"
              children={(field) => (
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть категорію" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.data.map((category: any) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            {/* <Button type="submit" disabled={loading}>
              {transaction ? "Оновити" : "Додати"} транзакцію
            </Button> */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit} className="w-full">
                  {isSubmitting ? "Обробка..." : budget ? "Оновити" : "Додати"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
