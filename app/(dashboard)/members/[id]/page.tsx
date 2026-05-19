import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MemberDetailCard } from "@/widgets/member-detail-card";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export const metadata: Metadata = {
  title: "회원 상세",
};

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId) || memberId <= 0) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="회원 상세"
        description={`회원 ID #${memberId}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/members">
              <ArrowLeft />
              목록으로
            </Link>
          </Button>
        }
      />
      <MemberDetailCard memberId={memberId} />
    </>
  );
}
