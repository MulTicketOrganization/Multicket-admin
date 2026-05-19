import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PerformanceDetailCard } from "@/widgets/performance-detail-card";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = {
  title: "공연 상세",
};

interface PerformanceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PerformanceDetailPage({ params }: PerformanceDetailPageProps) {
  const { id } = await params;
  const performanceId = Number(id);
  if (!Number.isInteger(performanceId) || performanceId <= 0) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="공연 상세"
        description={`공연 ID #${performanceId}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/performances">
              <ArrowLeft />
              목록으로
            </Link>
          </Button>
        }
      />
      <PerformanceDetailCard performanceId={performanceId} />
    </>
  );
}
