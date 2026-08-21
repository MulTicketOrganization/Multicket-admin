import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { SettlementDetailCard } from "@/widgets/settlement-detail-card";

export const metadata: Metadata = {
  title: "정산 상세",
};

export default async function SettlementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const settlementId = Number.parseInt(id, 10);
  if (!Number.isFinite(settlementId) || settlementId <= 0) notFound();

  return (
    <>
      <PageHeader
        title="정산 상세"
        description={`정산 #${settlementId}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/settlements">
              <ArrowLeft />
              목록으로
            </Link>
          </Button>
        }
      />
      <SettlementDetailCard settlementId={settlementId} />
    </>
  );
}
