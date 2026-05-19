"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type ThemeKey = "light" | "dark" | "system";

const OPTIONS: Array<{ value: ThemeKey; label: string; icon: typeof Sun }> = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
  { value: "system", label: "시스템 설정", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes 는 mount 전에 theme 가 undefined → SSR mismatch 회피용
  useEffect(() => setMounted(true), []);

  // mount 전엔 라이트 모드 아이콘으로 자리 차지 (interaction 차단)
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="테마 전환" disabled>
        <Sun />
      </Button>
    );
  }

  const TriggerIcon = resolvedTheme === "dark" ? Moon : Sun;
  const current = (theme ?? "system") as ThemeKey;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="테마 전환">
          <TriggerIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = current === opt.value;
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => setTheme(opt.value)}
              className="gap-2"
            >
              <Icon className="size-4" />
              <span className="flex-1">{opt.label}</span>
              {selected && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
