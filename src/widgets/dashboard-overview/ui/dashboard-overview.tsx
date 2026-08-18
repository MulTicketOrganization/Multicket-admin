"use client";

import { CircleAlert, Inbox, Server, Siren, UserCheck, Wallet } from "lucide-react";

import { useJobInstances } from "@/entities/batch";
import { InquiryStatus, flattenInquiryPages, useInquiryList } from "@/entities/inquiry";
import {
  MemberStatus,
  MemberType,
  flattenMemberPages,
  useMemberList,
} from "@/entities/member";
import { ReportStatus, flattenReportPages, useReportList } from "@/entities/report";
import { netAmount, sumRevenue, useMonthlyRevenue } from "@/entities/revenue";
import { StatCard } from "@/shared/ui/stat-card";
import { formatNumber } from "@/shared/lib/format";

/**
 * 대시보드 상단 KPI.
 *
 * 백엔드에 집계(count) 전용 API 가 없어 목록 API 의 첫 페이지로 대신한다.
 * 목록은 cursor 페이지네이션(10건 고정)이라 한 페이지를 다 채우면 "10+" 로 표기한다 —
 * 정확한 총계가 필요하면 백엔드에 카운트 API 추가가 필요하다.
 */
export function DashboardOverview() {
  const pendingInquiries = useInquiryList({ inquiryStatus: InquiryStatus.PENDING });
  const pendingReports = useReportList({ status: ReportStatus.PENDING });
  const pendingCreators = useMemberList({
    memberType: MemberType.CREATOR,
    memberStatus: MemberStatus.PENDING,
  });
  const incompleteJobs = useJobInstances(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const revenue = useMonthlyRevenue(year, month);

  const inquiries = countFirstPages(
    pendingInquiries.data ? flattenInquiryPages(pendingInquiries.data.pages) : [],
    pendingInquiries.data?.pages.at(-1)?.hasNext ?? false,
  );
  const reports = countFirstPages(
    pendingReports.data ? flattenReportPages(pendingReports.data.pages) : [],
    pendingReports.data?.pages.at(-1)?.hasNext ?? false,
  );
  const creators = countFirstPages(
    pendingCreators.data ? flattenMemberPages(pendingCreators.data.pages) : [],
    pendingCreators.data?.pages.at(-1)?.hasNext ?? false,
  );

  const jobCount = incompleteJobs.data?.length ?? 0;
  const totals = sumRevenue(revenue.data ?? []);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="승인 대기 창작자"
        value={creators.display}
        hint={creators.count > 0 ? "가입 승인이 필요합니다" : "대기 중인 신청이 없습니다"}
        icon={<UserCheck className="size-4" />}
        href="/members?type=CREATOR&status=PENDING"
        loading={pendingCreators.isPending}
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
      <StatCard
        label="이번 달 결제"
        value={`${formatNumber(totals.payment)}원`}
        hint={`${year}년 ${month}월`}
        icon={<Wallet className="size-4" />}
        href="/revenue"
        loading={revenue.isPending}
      />
      <StatCard
        label="이번 달 순매출"
        value={`${formatNumber(netAmount(totals.payment, totals.cancel))}원`}
        hint={`취소 ${formatNumber(totals.cancel)}원 차감`}
        href="/revenue"
        loading={revenue.isPending}
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
