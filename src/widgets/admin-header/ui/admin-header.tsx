"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_ITEMS, isNavItemActive } from "@/widgets/admin-sidebar";
import { LogoutButton } from "@/features/auth-logout";
import { APP_NAME } from "@/shared/config/constants";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

import { AccountBadge } from "./account-badge";

export function AdminHeader() {
  const pathname = usePathname();
  const current = ADMIN_NAV_ITEMS.find((item) => isNavItemActive(item, pathname));

  return (
    <header className="sticky top-0 z-10 h-14 shrink-0 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="h-full px-6 flex items-center justify-between gap-2">
        {/* 모바일에서는 사이드바가 숨겨지므로 현재 위치를 헤더에 표시한다 */}
        <Link href="/dashboard" className="min-w-0 truncate text-sm font-medium">
          {current?.label ?? APP_NAME}
        </Link>

        <div className="flex items-center gap-2">
          <AccountBadge />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
