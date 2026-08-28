import type { Metadata } from "next";

import { PageHeader } from "@/shared/ui/page-header";
import { ConsentDocumentManager } from "@/widgets/consent-document-manager";

export const metadata: Metadata = {
  title: "약관 관리",
};

export default function ConsentDocumentsPage() {
  return (
    <>
      <PageHeader
        title="약관 관리"
        description="온보딩·마이페이지에 노출되는 약관 본문을 발행합니다. 새 버전을 발행하면 해당 약관에 동의했던 회원 전원의 동의가 해제됩니다."
      />
      <ConsentDocumentManager />
    </>
  );
}
