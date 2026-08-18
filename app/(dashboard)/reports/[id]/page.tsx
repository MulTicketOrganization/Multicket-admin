import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ReportDetailCard } from "@/widgets/report-detail-card";

export const metadata: Metadata = {
  title: "신고 상세",
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reportId = Number.parseInt(id, 10);
  if (!Number.isFinite(reportId) || reportId <= 0) notFound();

  return (
    <>
      <PageHeader
        title="신고 상세"
        description={`신고 #${reportId}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/reports">
              <ArrowLeft />
              목록으로
            </Link>
          </Button>
        }
      />
      <ReportDetailCard reportId={reportId} />
    </>
  );
}
