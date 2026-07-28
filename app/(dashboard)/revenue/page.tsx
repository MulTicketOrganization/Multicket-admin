import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { RevenuePeriodFilter } from "@/features/revenue-period-filter";
import { RevenueTable } from "@/widgets/revenue-table";

export const metadata: Metadata = {
  title: "매출 조회",
};

export default function RevenuePage() {
  return (
    <>
      <PageHeader
        title="매출 조회"
        description="선택한 월(1일~말일) 의 크리에이터별·공연별 결제 및 취소 내역입니다."
        actions={
          <Suspense fallback={<Skeleton className="h-9 w-72" />}>
            <RevenuePeriodFilter />
          </Suspense>
        }
      />

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <RevenueTable />
      </Suspense>
    </>
  );
}
