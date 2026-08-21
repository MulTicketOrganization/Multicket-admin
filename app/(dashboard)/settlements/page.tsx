import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { SettlementListFilter } from "@/features/settlement-list-filter";
import { SettlementListTable } from "@/widgets/settlement-list-table";

export const metadata: Metadata = {
  title: "정산 관리",
};

export default function SettlementsPage() {
  return (
    <>
      <PageHeader
        title="정산 관리"
        description="회차 단위로 생성된 창작자 정산 내역을 확인하고 PG사 정산을 요청합니다."
      />

      {/* useSearchParams 를 쓰는 클라이언트 컴포넌트라 Suspense 경계가 필요 */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <SettlementListFilter />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <SettlementListTable />
      </Suspense>
    </>
  );
}
