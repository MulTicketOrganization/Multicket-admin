"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME } from "@/shared/config/constants";
import { cn } from "@/shared/lib/utils";

import { ADMIN_NAV_ITEMS, isNavItemActive } from "../model/nav-items";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="h-14 flex items-center px-6 border-b">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          {APP_NAME}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 text-[11px] text-muted-foreground border-t">
        v0.1 · {new Date().getFullYear()}
      </div>
    </aside>
  );
}
