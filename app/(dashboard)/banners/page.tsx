import type { Metadata } from "next";

import { PageHeader } from "@/shared/ui/page-header";
import { BannerManager } from "@/widgets/banner-manager";

export const metadata: Metadata = {
  title: "홈 배너 관리",
};

export default function BannersPage() {
  return (
    <>
      <PageHeader
        title="홈 배너 관리"
        description="앱 홈 하단 캐러셀에 노출할 배너를 관리합니다. 노출 기간에 걸린 배너만 앱에 나갑니다."
      />
      <BannerManager />
    </>
  );
}
