import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { MemberListFilter } from "@/features/member-list-filter";
import { MemberListTable } from "@/widgets/member-list-table";

export const metadata: Metadata = {
  title: "회원 관리",
};

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="회원 관리"
        description="가입된 회원을 검색하고 상태를 관리합니다."
      />

      <Suspense fallback={<FilterSkeleton />}>
        <MemberListFilter />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <MemberListTable />
      </Suspense>
    </>
  );
}

function FilterSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
    </div>
  );
}

function TableSkeleton() {
  return <Skeleton className="h-96 w-full" />;
}
