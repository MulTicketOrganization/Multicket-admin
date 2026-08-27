import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { FailedEventListFilter } from "@/features/failed-event-list-filter";
import { FailedEventListTable } from "@/widgets/failed-event-list-table";

export const metadata: Metadata = {
  title: "이벤트 이력",
};

export default function FailedEventsPage() {
  return (
    <>
      <PageHeader
        title="이벤트 이력"
        description="outbox → RabbitMQ → inbox 파이프라인을 지나간 이벤트 처리 이력입니다. 실패(FAILED) 건은 원본 payload 를 확인하고 재실행하거나 확인 처리할 수 있습니다."
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
