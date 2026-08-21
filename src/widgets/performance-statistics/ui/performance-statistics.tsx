"use client";

import { BarChart3 } from "lucide-react";

import {
  sessionSaleStatusLabel,
  sessionSaleStatusVariant,
  usePerformanceStatistics,
  type SessionStatistics,
} from "@/entities/performance";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatCard } from "@/shared/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { formatDateTime, formatNumber, formatPrice } from "@/shared/lib/format";

const COLUMN_COUNT = 7;

/** 공연 통계 — 총 예매/취소/매출 + 회차별 예매 현황. */
export function PerformanceStatistics({ performanceId }: { performanceId: number }) {
  const { data, isPending, isError, error } = usePerformanceStatistics(performanceId);

  if (isError) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">예매 통계</h2>
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "통계를 불러오지 못했습니다."}
          </CardContent>
        </Card>
      </section>
    );
  }

  const sessions = data?.sessions ?? [];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">예매 통계</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="총 예매"
          value={`${formatNumber(data?.totalReservationCount ?? null)}건`}
          icon={<BarChart3 className="size-4" />}
          loading={isPending}
        />
        <StatCard
          label="총 취소"
          value={`${formatNumber(data?.totalCancelCount ?? null)}건`}
          loading={isPending}
        />
        <StatCard
          label="취소율"
          value={data ? `${data.cancelRate.toFixed(1)}%` : "-"}
          hint="취소 / (예매 + 취소)"
          loading={isPending}
        />
        <StatCard
          label="총 매출"
          value={formatPrice(data?.totalRevenue ?? null)}
          hint="환불분이 반영된 금액"
          loading={isPending}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">회차</TableHead>
              <TableHead className="w-24">판매 상태</TableHead>
              <TableHead className="w-28">정원</TableHead>
              <TableHead className="w-32">판매 좌석</TableHead>
              <TableHead className="w-28">잔여</TableHead>
              <TableHead className="w-32">예매 / 취소</TableHead>
              <TableHead className="w-32">매출</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <SkeletonRows count={3} />
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  등록된 회차가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((s) => <SessionRow key={s.ticketDateId} session={s} />)
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        &lsquo;현재 예매 인원&rsquo; 은 결제 대기(PENDING)를 포함하므로 판매 좌석수보다 클
        수 있습니다. 잔여 인원은 정원에서 현재 예매 인원을 뺀 값입니다.
      </p>
    </section>
  );
}

function SessionRow({ session: s }: { session: SessionStatistics }) {
  return (
    <TableRow>
      <TableCell className="text-sm">{formatDateTime(s.enableDate)}</TableCell>
      <TableCell>
        <Badge variant={sessionSaleStatusVariant[s.saleStatus]}>
          {sessionSaleStatusLabel[s.saleStatus]}
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums text-sm">{formatNumber(s.capacity)}</TableCell>
      <TableCell className="tabular-nums text-sm">
        {formatNumber(s.totalSoldSeats)}
        <span className="ml-2 text-xs text-muted-foreground">
          {s.occupancyRate.toFixed(1)}%
        </span>
      </TableCell>
      <TableCell className="tabular-nums text-sm">
        {formatNumber(s.remainingSeats)}
        <span className="ml-2 text-xs text-muted-foreground">
          대기 {formatNumber(s.currentReservationSeats - s.totalSoldSeats)}
        </span>
      </TableCell>
      <TableCell className="tabular-nums text-sm text-muted-foreground">
        {formatNumber(s.reservationCount)} / {formatNumber(s.cancelCount)}
      </TableCell>
      <TableCell className="tabular-nums text-sm">{formatPrice(s.revenue)}</TableCell>
    </TableRow>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full max-w-24" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
