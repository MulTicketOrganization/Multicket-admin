import type { Metadata } from "next";

import { PageHeader } from "@/shared/ui/page-header";
import { BatchTable } from "@/widgets/batch-table";

export const metadata: Metadata = {
  title: "배치 관리",
};

export default function BatchPage() {
  return (
    <>
      <PageHeader
        title="배치 관리"
        description="Spring Batch JobInstance 의 최근 실행 상태를 확인하고, 실패한 배치를 이어서 재실행합니다."
      />
      <BatchTable />
    </>
  );
}
