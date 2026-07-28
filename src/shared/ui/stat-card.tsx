import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  href?: string;
  loading?: boolean;
  className?: string;
}

/** 대시보드 KPI 타일. 숫자 하나 + 보조 설명. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  loading = false,
  className,
}: StatCardProps) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col gap-2 rounded-lg border bg-card p-4 transition-colors",
        href && "hover:bg-accent/50",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <span className="text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
      )}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );

  if (!href) return body;
  return (
    <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      {body}
    </Link>
  );
}
