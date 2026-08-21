import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { NoticeDetailCard } from "@/widgets/notice-detail-card";

export const metadata: Metadata = {
  title: "공고 상세",
};

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const noticeId = Number.parseInt(id, 10);
  if (!Number.isFinite(noticeId) || noticeId <= 0) notFound();

  return (
    <>
      <PageHeader
        title="공고 상세"
        description={`공고 #${noticeId}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/notices">
              <ArrowLeft />
              목록으로
            </Link>
          </Button>
        }
      />
      <NoticeDetailCard noticeId={noticeId} />
    </>
  );
}
