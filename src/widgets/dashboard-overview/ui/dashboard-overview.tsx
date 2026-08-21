"use client";

import {
  CircleAlert,
  Inbox,
  Server,
  ShoppingCart,
  Siren,
  Ticket,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import { useJobInstances } from "@/entities/batch";
import { useDashboardSummary } from "@/entities/dashboard";
import { InquiryStatus, flattenInquiryPages, useInquiryList } from "@/entities/inquiry";
import { ReportStatus, flattenReportPages, useReportList } from "@/entities/report";
import { StatCard } from "@/shared/ui/stat-card";
import { formatNumber } from "@/shared/lib/format";

/**
 * 대시보드 상단 KPI.
 *
 * 회원·공연·매출 집계는 `GET /admin/dashboard` 의 정확한 총계를 쓴다.
 * 신고·문의·배치는 아직 카운트 API 가 없어 목록 첫 페이지(10건 고정)로 대신하며,
 * 페이지를 다 채우면 "10+" 로 표기해 총계가 아님을 드러낸다.
 */
export function DashboardOverview() {
  const summary = useDashboardSummary();

  const pendingInquiries = useInquiryList({ inquiryStatus: InquiryStatus.PENDING });
  const pendingReports = useReportList({ status: ReportStatus.PENDING });
  const incompleteJobs = useJobInstances(true);

  const inquiries = countFirstPages(
    pendingInquiries.data ? flattenInquiryPages(pendingInquiries.data.pages) : [],
    pendingInquiries.data?.pages.at(-1)?.hasNext ?? false,
  );
  const reports = countFirstPages(
    pendingReports.data ? flattenReportPages(pendingReports.data.pages) : [],
    pendingReports.data?.pages.at(-1)?.hasNext ?? false,
  );

  const jobCount = incompleteJobs.data?.length ?? 0;
  const s = summary.data;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="오늘 판매"
        value={`${formatNumber(s?.todaySalesCount ?? null)}건`}
        hint="오늘 결제 확정된 주문 수"
        icon={<ShoppingCart className="size-4" />}
        loading={summary.isPending}
      />
      <StatCard
        label="오늘 순매출"
        value={`${formatNumber(s?.todayRevenue ?? null)}원`}
        hint="취소·환불이 반영된 금액"
        icon={<Wallet className="size-4" />}
        href="/revenue"
        loading={summary.isPending}
      />
      <StatCard
        label="판매중 공연"
        value={formatNumber(s?.onSalePerformanceCount ?? null)}
        hint="현재 판매 기간에 걸쳐 있는 공연"
        icon={<Ticket className="size-4" />}
        href="/performances"
        loading={summary.isPending}
      />
      <StatCard
        label="승인 대기 창작자"
        value={formatNumber(s?.pendingCreatorCount ?? null)}
        hint={
          s && s.pendingCreatorCount > 0
            ? "가입 승인이 필요합니다"
            : "대기 중인 신청이 없습니다"
        }
        icon={<UserCheck className="size-4" />}
        href="/members?type=CREATOR&status=PENDING"
        loading={summary.isPending}
      />
      <StatCard
        label="가입 회원"
        value={formatNumber(
          s ? s.activeAudienceCount + s.activeCreatorCount : null,
        )}
        hint={
          s
            ? `관객 ${formatNumber(s.activeAudienceCount)} · 창작자 ${formatNumber(s.activeCreatorCount)}`
            : "탈퇴 회원 제외"
        }
        icon={<Users className="size-4" />}
        href="/members?type=AUDIENCE"
        loading={summary.isPending}
      />
      <StatCard
        label="미처리 신고"
        value={reports.display}
        hint={reports.count > 0 ? "확인이 필요합니다" : "모두 처리되었습니다"}
        icon={<Siren className="size-4" />}
        href="/reports?status=PENDING"
        loading={pendingReports.isPending}
      />
      <StatCard
        label="처리 대기 문의"
        value={inquiries.display}
        hint={inquiries.count > 0 ? "확인이 필요합니다" : "모두 처리되었습니다"}
        icon={<Inbox className="size-4" />}
        href="/inquiries?status=PENDING"
        loading={pendingInquiries.isPending}
      />
      <StatCard
        label="미완료 배치"
        value={jobCount}
        hint={jobCount > 0 ? "재실행이 필요할 수 있습니다" : "이상 없음"}
        icon={jobCount > 0 ? <CircleAlert className="size-4" /> : <Server className="size-4" />}
        href="/batch"
        loading={incompleteJobs.isPending}
      />
    </div>
  );
}

/** 첫 페이지만 세므로, 페이지를 다 채웠으면 "N+" 로 표기해 총계가 아님을 드러낸다. */
function countFirstPages(
  rows: ReadonlyArray<unknown>,
  hasNext: boolean,
): { count: number; display: string } {
  return { count: rows.length, display: `${rows.length}${hasNext ? "+" : ""}` };
}
