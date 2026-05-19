import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { LogoutButton } from "@/features/auth-logout";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function DashboardPage() {
  return (
    <main className="flex flex-1 items-start justify-center px-6 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl tracking-tight">대시보드</CardTitle>
            <CardDescription>
              로그인에 성공했습니다. 사이드바 셸과 회원/공연 화면은 다음 라운드에서 추가됩니다.
            </CardDescription>
          </div>
          <LogoutButton />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          현재는 인증 가드와 httpOnly 쿠키 발급 흐름이 정상 동작하는지 확인하는 placeholder 페이지입니다.
        </CardContent>
      </Card>
    </main>
  );
}
