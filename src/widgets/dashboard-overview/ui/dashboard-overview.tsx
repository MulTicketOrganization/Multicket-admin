"use client";

import { CircleAlert, Inbox, Server, Wallet } from "lucide-react";

import { useJobInstances } from "@/entities/batch";
import { InquiryStatus, flattenInquiryPages, useInquiryList } from "@/entities/inquiry";
import { netAmount, sumRevenue, useMonthlyRevenue } from "@/entities/revenue";
import { StatCard } from "@/shared/ui/stat-card";
import { formatNumber } from "@/shared/lib/format";

/**
 * 대시보드 상단 KPI.
 *
 * 백엔드에 집계 전용 API 가 없어 목록 API 의 첫 페이지로 대신한다.
 * 문의는 cursor 페이지네이션(10건 고정)이라 10건을 채우면 "10+" 로 표기한다 —
 * 정확한 총계가 필요하면 백엔드에 카운트 API 추가가 필요하다.
 */
export function DashboardOverview() {
  const pendingInquiries = useInquiryList({ inquiryStatus: InquiryStatus.PENDING });
  const incompleteJobs = useJobInstances(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const revenue = useMonthlyRevenue(year, month);

  const inquiryRows = pendingInquiries.data
    ? flattenInquiryPages(pendingInquiries.data.pages)
    : [];
  const inquiryCount = inquiryRows.length;
  const inquiryHasMore = pendingInquiries.data?.pages.at(-1)?.hasNext ?? false;

  const jobCount = incompleteJobs.data?.length ?? 0;
  const totals = sumRevenue(revenue.data ?? []);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="처리 대기 문의"
        value={`${inquiryCount}${inquiryHasMore ? "+" : ""}`}
        hint={inquiryCount > 0 ? "확인이 필요합니다" : "모두 처리되었습니다"}
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
