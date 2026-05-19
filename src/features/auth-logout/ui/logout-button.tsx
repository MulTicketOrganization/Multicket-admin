"use client";

import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";

import { useLogout } from "../model/use-logout";

interface LogoutButtonProps {
  /** 버튼 variant. 기본 outline. */
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function LogoutButton({ variant = "outline" }: LogoutButtonProps) {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleClick = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("로그아웃되었습니다.");
        router.replace("/login");
        router.refresh();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "로그아웃에 실패했습니다.");
      },
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={handleClick}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
      로그아웃
    </Button>
  );
}
