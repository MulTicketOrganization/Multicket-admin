import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** 우측에 표시할 액션 영역 (검색 / 버튼 등) */
  actions?: ReactNode;
  className?: string;
}

/**
 * 페이지 상단 heading 영역.
 * 사이드바/헤더 chrome 과 별개로 콘텐츠 영역 최상단에 배치한다.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
