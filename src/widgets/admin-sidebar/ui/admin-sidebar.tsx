"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { APP_NAME } from "@/shared/config/constants";
import { cn } from "@/shared/lib/utils";

import { ADMIN_NAV_GROUPS, isNavItemActive } from "../model/nav-items";

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="h-14 flex items-center px-6 border-b">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          {APP_NAME}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {ADMIN_NAV_GROUPS.map((group, gi) => (
          <div key={group.title ?? `group-${gi}`} className={gi > 0 ? "mt-4" : undefined}>
            {group.title && (
              <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(item, pathname, searchParams);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      active ? "bg-accent text-foreground" : "text-muted-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 text-[11px] text-muted-foreground border-t">v0.1 · Multicket</div>
    </aside>
  );
}
