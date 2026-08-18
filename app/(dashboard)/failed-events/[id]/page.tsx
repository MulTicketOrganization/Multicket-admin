import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { FailedEventDetailCard } from "@/widgets/failed-event-detail-card";

export const metadata: Metadata = {
  title: "실패 이벤트 상세",
};

export default async function FailedEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);
  if (!Number.isFinite(eventId) || eventId <= 0) notFound();

  return (
    <>
      <PageHeader
        title="실패 이벤트 상세"
        description={`이벤트 #${eventId}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/failed-events">
              <ArrowLeft />
              목록으로
            </Link>
          </Button>
        }
      />
      <FailedEventDetailCard eventId={eventId} />
    </>
  );
}
