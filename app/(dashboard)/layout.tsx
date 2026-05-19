import type { ReactNode } from "react";

/**
 * (dashboard) 라우트 그룹 레이아웃.
 * 인증 가드는 middleware.ts 가 담당 — 여기 도달했다면 이미 토큰이 있음.
 * 실제 사이드바 / 헤더 셸은 라운드 3 에서 구현 예정.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex flex-col bg-muted/20">{children}</div>;
}
