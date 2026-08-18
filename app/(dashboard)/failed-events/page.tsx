import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { FailedEventListFilter } from "@/features/failed-event-list-filter";
import { FailedEventListTable } from "@/widgets/failed-event-list-table";

export const metadata: Metadata = {
  title: "실패 이벤트",
};

export default function FailedEventsPage() {
  return (
    <>
      <PageHeader
        title="실패 이벤트"
        description="컨슈머 처리에 실패해 DLQ 로 빠진 메시지입니다. 원본 payload 를 확인하고 재실행하거나 확인 처리합니다."
      />

      {/* useSearchParams 를 쓰는 클라이언트 컴포넌트라 Suspense 경계가 필요 */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <FailedEventListFilter />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <FailedEventListTable />
      </Suspense>
    </>
  );
}
