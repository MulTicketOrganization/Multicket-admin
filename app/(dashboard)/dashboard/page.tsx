import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ticket, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="대시보드"
        description="Multicket 관리자 페이지에 오신 것을 환영합니다."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ShortcutCard
          href="/members"
          icon={<Users className="size-5" />}
          title="회원 관리"
          description="회원 목록 조회, 상태 변경 (가입 대기 / 완료 / 동결)."
        />
        <ShortcutCard
          href="/performances"
          icon={<Ticket className="size-5" />}
          title="공연 관리"
          description="공연 목록 조회, 상세 정보 확인."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">통계 카드 (예정)</CardTitle>
          <CardDescription>
            백엔드에 통계 API 가 추가되면 총 회원 수 / 신규 가입 / 활성 공연 등 KPI 가 여기 표시됩니다.
            (현재 백엔드 미구현 — TODO.md §1.2 참고)
          </CardDescription>
        </CardHeader>
      </Card>
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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-primary">{icon}</span>
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
