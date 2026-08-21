import type { Metadata } from "next";

import { PageHeader } from "@/shared/ui/page-header";
import { AppVersionManager } from "@/widgets/app-version-manager";

export const metadata: Metadata = {
  title: "앱 버전 관리",
};

export default function AppVersionsPage() {
  return (
    <>
      <PageHeader
        title="앱 버전 관리"
        description="플랫폼별 앱 버전과 업데이트 내역을 등록합니다. 강제 업데이트 여부는 공고 관리의 '앱 업데이트 안내' 로 지정합니다."
      />
      <AppVersionManager />
    </>
  );
}
