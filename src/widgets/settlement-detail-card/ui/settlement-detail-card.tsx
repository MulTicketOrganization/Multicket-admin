"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

import {
  SettlementStatus,
  canRequestTransfer,
  settlementStatusLabel,
  settlementStatusVariant,
  useSettlementDetail,
} from "@/entities/settlement";
import { SettlementTransferButton } from "@/features/settlement-transfer";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateTime, formatPrice } from "@/shared/lib/format";

export function SettlementDetailCard({ settlementId }: { settlementId: number }) {
  const { data, isPending, isError, error } = useSettlementDetail(settlementId);

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-3 py-5">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="정산 내역을 불러오지 못했습니다."
        description={error instanceof Error ? error.message : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={settlementStatusVariant[data.status]}>
              {settlementStatusLabel[data.status]}
            </Badge>
            {data.status === SettlementStatus.SUCCESS && data.successAt && (
              <span className="text-xs text-muted-foreground">
                {formatDateTime(data.successAt)} 이체 완료
              </span>
            )}
            <div className="ml-auto">
              <SettlementTransferButton
                settlementId={data.id}
                disabled={!canRequestTransfer(data.status)}
              />
            </div>
          </div>

          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Field
              label="공연"
              value={
                <Link
                  href={`/performances/${data.performanceId}`}
                  className="hover:text-primary hover:underline underline-offset-4"
                >
                  {data.performanceTitle}
                </Link>
              }
            />
            <Field label="공연장" value={data.venueName ?? "-"} />
            <Field label="정산 대상 회차" value={formatDateTime(data.enableDate)} />
            <Field
              label="창작자"
              value={
                <Link
                  href={`/members/${data.creatorId}`}
                  className="hover:text-primary hover:underline underline-offset-4"
                >
                  {data.creatorNickName} · {data.creatorEmail}
                </Link>
              }
            />
            <Field label="생성일" value={formatDateTime(data.createDate)} />
            <Field label="정산 예정일" value={formatDateTime(data.settlementDate)} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-5">
          <h3 className="text-sm font-semibold">금액 산출 근거</h3>
          <dl className="space-y-2 text-sm">
            <AmountRow label="총 성공 결제금액" value={data.totalSuccessAmount} />
            <AmountRow label="총 취소금액" value={-data.totalCancelAmount} />
            <AmountRow
              label={`플랫폼 수수료 (${data.feeRatePercent}%)`}
              value={-data.feeAmount}
            />
            <Separator />
            <AmountRow label="최종 정산금액" value={data.finalAmount} emphasis />
          </dl>

          {data.settlementAmount !== data.finalAmount && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              백엔드가 내려준 `settlementAmount`({formatPrice(data.settlementAmount)})와
              `finalAmount`({formatPrice(data.finalAmount)})가 다릅니다. 같은 값이어야
              하는 항목이라 확인이 필요합니다.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            PortOne 수기 이체 ID:{" "}
            <span className="font-mono">
              {data.portoneTransferId ?? "아직 이체 전 (null)"}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </div>
  );
}

function AmountRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={emphasis ? "font-medium" : "text-muted-foreground"}>{label}</dt>
      <dd
        className={
          emphasis
            ? "text-base font-semibold tabular-nums"
            : "tabular-nums text-muted-foreground"
        }
      >
        {formatPrice(value)}
      </dd>
    </div>
  );
}
