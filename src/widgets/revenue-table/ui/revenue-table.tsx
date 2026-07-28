"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronRight, Wallet } from "lucide-react";

import {
  netAmount,
  sumRevenue,
  useMonthlyRevenue,
  type MonthlyCreatorRevenue,
} from "@/entities/revenue";
import { useRevenuePeriod } from "@/features/revenue-period-filter";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatCard } from "@/shared/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { formatNumber } from "@/shared/lib/format";

export function RevenueTable() {
  const { year, month } = useRevenuePeriod();
  const { data, isPending, isError, error } = useMonthlyRevenue(year, month);

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <AlertTriangle className="size-6 text-destructive" />
          <p className="text-sm">
            {error instanceof Error ? error.message : "매출을 불러오지 못했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const rows = data ?? [];
  const totals = sumRevenue(rows);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="결제 총액"
          value={`${formatNumber(totals.payment)}원`}
          hint={`${year}년 ${month}월`}
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="취소 총액"
          value={`${formatNumber(totals.cancel)}원`}
          hint="환불 포함"
        />
        <StatCard
          label="순매출"
          value={`${formatNumber(netAmount(totals.payment, totals.cancel))}원`}
          hint="결제 − 취소"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="해당 월의 매출 내역이 없습니다."
          description={`${year}년 ${month}월에 발생한 결제·취소 건이 없습니다. 다른 월을 선택해 보세요.`}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>크리에이터</TableHead>
                <TableHead className="w-40 text-right">결제 (원)</TableHead>
                <TableHead className="w-40 text-right">취소 (원)</TableHead>
                <TableHead className="w-40 text-right">순매출 (원)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <CreatorRows key={r.creatorId} revenue={r} />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-medium">
                  합계 ({rows.length}명)
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatNumber(totals.payment)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatNumber(totals.cancel)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatNumber(netAmount(totals.payment, totals.cancel))}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
}

/** 크리에이터 행 + 펼쳤을 때의 공연별 행 */
function CreatorRows({ revenue: r }: { revenue: MonthlyCreatorRevenue }) {
  const [expanded, setExpanded] = useState(false);
  const performances = r.performances ?? [];
  const canExpand = performances.length > 0;

  return (
    <>
      <TableRow
        className={canExpand ? "cursor-pointer" : undefined}
        onClick={() => canExpand && setExpanded((v) => !v)}
      >
        <TableCell>
          {canExpand && (
            <button
              type="button"
              aria-label={expanded ? "공연별 내역 접기" : "공연별 내역 펼치기"}
              aria-expanded={expanded}
              className="text-muted-foreground"
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          )}
        </TableCell>
        <TableCell>
          <Link
            href={`/members/${r.creatorId}`}
            className="font-medium hover:text-primary hover:underline underline-offset-4"
            onClick={(e) => e.stopPropagation()}
          >
            {r.creatorNickName ?? `크리에이터 #${r.creatorId}`}
          </Link>
          <div className="text-xs text-muted-foreground">
            {r.creatorEmail ?? "-"}
            {r.creatorPhone ? ` · ${r.creatorPhone}` : ""}
          </div>
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatNumber(r.totalPaymentAmount)}
        </TableCell>
        <TableCell className="text-right tabular-nums text-muted-foreground">
          {formatNumber(r.totalCancelAmount)}
        </TableCell>
        <TableCell className="text-right font-medium tabular-nums">
          {formatNumber(netAmount(r.totalPaymentAmount, r.totalCancelAmount))}
        </TableCell>
      </TableRow>

      {expanded &&
        performances.map((p) => (
          <TableRow key={p.performanceId} className="bg-muted/30">
            <TableCell />
            <TableCell className="pl-8">
              <Link
                href={`/performances/${p.performanceId}`}
                className="text-sm hover:text-primary hover:underline underline-offset-4"
              >
                {p.performanceTitle}
              </Link>
            </TableCell>
            <TableCell className="text-right text-sm tabular-nums">
              {formatNumber(p.paymentAmount)}
            </TableCell>
            <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
              {formatNumber(p.cancelAmount)}
            </TableCell>
            <TableCell className="text-right text-sm tabular-nums">
              {formatNumber(netAmount(p.paymentAmount, p.cancelAmount))}
            </TableCell>
          </TableRow>
        ))}
    </>
  );
}
