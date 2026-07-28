import type { Metadata } from "next";

import { PageHeader } from "@/shared/ui/page-header";
import { NoticeManager } from "@/widgets/notice-manager";

export const metadata: Metadata = {
  title: "공고 관리",
};

export default function NoticesPage() {
  return (
    <>
      <PageHeader
        title="공고 관리"
        description="취소·환불 규정과 정산 방법 안내를 등록합니다. 등록할 때마다 새 이력이 쌓이고 최신 공고가 노출됩니다."
      />
      <NoticeManager />
    </>
  );
}
