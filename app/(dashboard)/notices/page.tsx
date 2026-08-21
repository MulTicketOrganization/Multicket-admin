import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { NoticeListFilter } from "@/features/notice-list-filter";
import { NoticeListTable } from "@/widgets/notice-list-table";
import { NoticeLiveStatus } from "@/widgets/notice-live-status";

export const metadata: Metadata = {
  title: "공고 관리",
};

export default function NoticesPage() {
  return (
    <>
      <PageHeader
        title="공고 관리"
        description="취소·환불 규정, 정산 안내, 앱 업데이트·긴급 공지·서버 점검 안내를 등록하고 수정합니다."
        actions={
          <Button asChild size="sm">
            <Link href="/notices/new">
              <Plus />
              새 공고
            </Link>
          </Button>
        }
      />

      {/* useSearchParams 를 쓰는 클라이언트 컴포넌트라 Suspense 경계가 필요 */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <NoticeListFilter />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <NoticeListTable />
      </Suspense>

      <NoticeLiveStatus />
    </>
  );
}
