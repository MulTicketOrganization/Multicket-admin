import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { InquiryListFilter } from "@/features/inquiry-list-filter";
import { InquiryListTable } from "@/widgets/inquiry-list-table";

export const metadata: Metadata = {
  title: "문의 관리",
};

export default function InquiriesPage() {
  return (
    <>
      <PageHeader
        title="문의 관리"
        description="회원 상태 변경·공연 검수·중복 신고 등 크리에이터 문의를 처리합니다."
      />

      {/* useSearchParams 를 쓰는 클라이언트 컴포넌트라 Suspense 경계가 필요 */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <InquiryListFilter />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <InquiryListTable />
      </Suspense>
    </>
  );
}
