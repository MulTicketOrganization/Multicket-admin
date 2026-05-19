import type { ReactNode } from "react";

import { AdminSidebar } from "@/widgets/admin-sidebar";
import { AdminHeader } from "@/widgets/admin-header";

/**
 * (dashboard) 라우트 그룹 레이아웃.
 * 인증 가드는 proxy.ts 가 담당 — 여기 도달했다면 토큰이 있다.
 *
 * 구조:
 * [Sidebar] | [Header]
 *           | [Content (scroll)]
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
