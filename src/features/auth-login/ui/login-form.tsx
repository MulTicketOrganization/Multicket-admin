"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

import { loginSchema, type LoginFormValues } from "../model/schema";
import { useLogin } from "../model/use-login";

const FALLBACK_REDIRECT = "/dashboard";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const redirectTarget = fromParam && fromParam.startsWith("/") ? fromParam : FALLBACK_REDIRECT;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mail: "", password: "" },
  });

  const loginMutation = useLogin();

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast.success("로그인 성공");
        router.replace(redirectTarget);
        router.refresh();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      },
    });
  });

  const isSubmitting = loginMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="mail">이메일</Label>
        <Input
          id="mail"
          type="email"
          autoComplete="email"
          placeholder="admin@multicket.com"
          aria-invalid={!!errors.mail}
          {...register("mail")}
        />
        {errors.mail && (
          <p className="text-xs text-destructive">{errors.mail.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className={cn("w-full")}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
