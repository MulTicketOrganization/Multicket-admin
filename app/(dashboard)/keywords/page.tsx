import type { Metadata } from "next";

import { PageHeader } from "@/shared/ui/page-header";
import { KeywordManager } from "@/widgets/keyword-manager";

export const metadata: Metadata = {
  title: "검색 키워드",
};

export default function KeywordsPage() {
  return (
    <>
      <PageHeader
        title="검색 키워드"
        description="앱 검색 화면에 노출되는 키워드를 관리합니다. 저장한 목록이 그대로 최종 활성 상태가 됩니다."
      />
      <KeywordManager />
    </>
  );
}
