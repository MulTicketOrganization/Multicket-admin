import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { NoticeForm } from "@/features/notice-write";

export const metadata: Metadata = {
  title: "공고 등록",
};

export default function NoticeCreatePage() {
  return (
    <>
      <PageHeader
        title="공고 등록"
        description="타입에 따라 필요한 값이 달라집니다. 앱 업데이트는 강제 여부, 점검은 시작 시각, 폴링 공고는 대상 플랫폼이 필요합니다."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/notices">
              <ArrowLeft />
              목록으로
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="py-5">
          <NoticeForm redirectTo="/notices" />
        </CardContent>
      </Card>
    </>
  );
}
