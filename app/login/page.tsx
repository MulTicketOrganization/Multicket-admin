import type { Metadata } from "next";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { APP_NAME } from "@/shared/config/constants";
import { LoginForm } from "@/features/auth-login";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1.5 text-center">
          <CardTitle className="text-2xl tracking-tight">{APP_NAME}</CardTitle>
          <CardDescription>관리자 계정으로 로그인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
