import Link from "next/link";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { APP_NAME } from "@/shared/config/constants";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl tracking-tight">{APP_NAME}</CardTitle>
          <CardDescription>
            Multicket 서비스 관리자 페이지입니다. 계속하려면 로그인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">대시보드로 이동 (개발용)</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
