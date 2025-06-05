"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { updateCurrency } from "@/app/actions/settings";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

export function ChangeCurrencyCard({ currency }: { currency: string }) {
  const form = useForm({
    defaultValues: {
      currency: currency || "UAH",
    },
    onSubmit: async ({ value }) => {
      const res = await updateCurrency(value.currency);
      //   if (res.error) {
      //     toast.error(res.error);
      //   }
      //   if (res.success) {
      //     toast.success(res.success);
      //   }
    },
  });

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle>Валюта</CardTitle>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent>
          <form.Field
            name="currency"
            children={(field) => (
              <div className="w-1/2">
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UAH">UAH (гривня)</SelectItem>
                    <SelectItem value="USD">USD (долар)</SelectItem>
                    <SelectItem value="EUR">EUR (євро)</SelectItem>
                  </SelectContent>
                </Select>
                {/* <FieldInfo field={field} /> */}
              </div>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit} size="sm">
                {isSubmitting ? "Оновлення..." : "Зберегти"}
              </Button>
            )}
          />
        </CardFooter>
      </form>
    </Card>
  );
}
