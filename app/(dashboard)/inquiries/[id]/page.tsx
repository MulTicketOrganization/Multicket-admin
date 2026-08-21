import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { InquiryDetailCard } from "@/widgets/inquiry-detail-card";

export const metadata: Metadata = {
  title: "문의 상세",
};

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiryId = Number.parseInt(id, 10);
  if (!Number.isFinite(inquiryId) || inquiryId <= 0) notFound();

  return (
    <>
      <PageHeader
        title="문의 상세"
        description={`문의 #${inquiryId}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/inquiries">
              <ArrowLeft />
              목록으로
            </Link>
          </Button>
        }
      />
      <InquiryDetailCard inquiryId={inquiryId} />
    </>
  );
}
