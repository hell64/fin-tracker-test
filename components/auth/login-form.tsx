"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await loginUser(formData);

      if (result.success) {
        toast({
          title: "Успіх",
          description: result.message,
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        toast({
          title: "Помилка",
          description: result.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Сталася помилка",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Пошта</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Пароль</Label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Забули пароль?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Увійти
          </Button>
        </div>
      </form>
    </div>
  );
}
