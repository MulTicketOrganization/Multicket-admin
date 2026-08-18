import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ADMIN_NAV_GROUPS } from "@/widgets/admin-sidebar";
import { DashboardOverview } from "@/widgets/dashboard-overview";

export const metadata: Metadata = {
  title: "대시보드",
};

/** 사이드바 항목과 짝이 되는 설명 — 대시보드 바로가기 카드에 쓴다 */
const SHORTCUT_DESCRIPTIONS: Record<string, string> = {
  "/members?type=AUDIENCE": "관객 회원 목록 조회, 계정 동결·정지 등 상태 처리.",
  "/members?type=CREATOR": "창작자 회원 목록과 등록 공연·계정 상태 확인.",
  "/members?type=CREATOR&status=PENDING": "가입 승인을 기다리는 창작자 신청 처리.",
  "/performances": "공연 목록·상세 조회, 공연 삭제.",
  "/reports": "공연 신고 접수 내역 확인 및 소견과 함께 처리.",
  "/inquiries": "회원 상태 변경·공연 검수 요청 등 문의 처리.",
  "/revenue": "월별 크리에이터·공연 단위 결제 및 취소 내역.",
  "/notices": "취소·환불 규정과 정산 안내 공고 등록.",
  "/keywords": "앱 검색 화면에 노출되는 키워드 관리.",
  "/batch": "배치 실행 상태 확인 및 실패 배치 재실행.",
  "/failed-events": "DLQ 로 빠진 메시지 확인 및 재실행.",
  "/account": "로그인한 관리자 계정 정보.",
};

export default function DashboardPage() {
  const shortcutGroups = ADMIN_NAV_GROUPS.filter((g) => g.title !== null);

  return (
    <>
      <PageHeader
        title="대시보드"
        description="Multicket 운영 현황 요약입니다."
      />

      <DashboardOverview />

      {shortcutGroups.map((group) => (
        <section key={group.title} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{group.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <ShortcutCard
                  key={item.href}
                  href={item.href}
                  icon={<Icon className="size-5" />}
                  title={item.label}
                  description={SHORTCUT_DESCRIPTIONS[item.href] ?? ""}
                />
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="transition-colors hover:bg-accent/40">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-muted-foreground">{icon}</span>
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button asChild variant="ghost" size="icon" aria-label={`${title}로 이동`}>
          <Link href={href}>
            <ArrowRight />
          </Link>
        </Button>
      </CardHeader>
    </Card>
  );
}
