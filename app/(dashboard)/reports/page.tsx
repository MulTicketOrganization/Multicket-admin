import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { ReportListFilter } from "@/features/report-list-filter";
import { ReportListTable } from "@/widgets/report-list-table";

export const metadata: Metadata = {
  title: "신고 관리",
};

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="신고 관리"
        description="공연에 대해 접수된 신고를 확인하고 소견과 함께 처리합니다."
      />

      {/* useSearchParams 를 쓰는 클라이언트 컴포넌트라 Suspense 경계가 필요 */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <ReportListFilter />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <ReportListTable />
      </Suspense>
    </>
  );
}
