import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { PerformanceListFilter } from "@/features/performance-list-filter";
import { PerformanceListTable } from "@/widgets/performance-list-table";

export const metadata: Metadata = {
  title: "공연 관리",
};

export default function PerformancesPage() {
  return (
    <>
      <PageHeader
        title="공연 관리"
        description="등록된 공연을 검색하고 상세 정보를 확인합니다."
      />

      <Suspense fallback={<FilterSkeleton />}>
        <PerformanceListFilter />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <PerformanceListTable />
      </Suspense>
    </>
  );
}

function FilterSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_160px_140px]">
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
    </div>
  );
}

function TableSkeleton() {
  return <Skeleton className="h-96 w-full" />;
}
