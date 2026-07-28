import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** 목록/패널이 비었을 때의 공통 표시. 오류가 아니라 "없음" 을 뜻한다. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-md text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
