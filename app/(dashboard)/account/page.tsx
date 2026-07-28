import type { Metadata } from "next";

import { PageHeader } from "@/shared/ui/page-header";
import { AccountCard } from "@/widgets/account-card";
import { LogoutButton } from "@/features/auth-logout";

export const metadata: Metadata = {
  title: "내 계정",
};

export default function AccountPage() {
  return (
    <>
      <PageHeader
        title="내 계정"
        description="현재 로그인한 관리자 계정 정보입니다."
        actions={<LogoutButton />}
      />
      <AccountCard />
    </>
  );
}
