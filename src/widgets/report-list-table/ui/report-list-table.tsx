"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  flattenReportPages,
  reportStatusLabel,
  reportStatusVariant,
  useReportList,
  type ReportListItem,
} from "@/entities/report";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Skeleton } from "@/shared/ui/skeleton";
import { useReportFilters } from "@/features/report-list-filter";
import { formatDateTime } from "@/shared/lib/format";

const COLUMN_COUNT = 5;

export function ReportListTable() {
  const { filters } = useReportFilters();
  const query = useReportList(filters);

  useEffect(() => {
    if (query.isError) {
      toast.error(
        query.error instanceof Error
          ? query.error.message
          : "신고 목록을 불러오지 못했습니다.",
      );
    }
  }, [query.isError, query.error]);

  const rows = query.data ? flattenReportPages(query.data.pages) : [];

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>신고 대상 공연</TableHead>
            <TableHead className="w-32">신고자</TableHead>
            <TableHead className="w-40">접수일</TableHead>
            <TableHead className="w-24">처리 상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isPending ? (
            <SkeletonRows count={6} />
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT}
                className="h-32 text-center text-sm text-muted-foreground"
              >
                조건에 맞는 신고가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => <ReportRow key={r.id} report={r} />)
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
        <span>
          총 {rows.length}건 로드됨{query.hasNextPage ? " (더 있음)" : ""}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void query.fetchNextPage()}
          disabled={!query.hasNextPage || query.isFetchingNextPage}
        >
          {query.isFetchingNextPage && <Loader2 className="animate-spin" />}
          {query.hasNextPage
            ? query.isFetchingNextPage
              ? "불러오는 중..."
              : "더 보기"
            : "마지막"}
        </Button>
      </div>
    </div>
  );
}

function ReportRow({ report: r }: { report: ReportListItem }) {
  const router = useRouter();
  const href = `/reports/${r.id}`;

  return (
    <TableRow
      className="cursor-pointer"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        router.push(href);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      tabIndex={0}
    >
      <TableCell className="font-mono text-xs text-muted-foreground">{r.id}</TableCell>
      <TableCell className="font-medium">
        <Link
          href={href}
          className="text-foreground hover:text-primary hover:underline underline-offset-4"
        >
          {r.performanceTitle}
        </Link>
        <Link
          href={`/performances/${r.performanceId}`}
          className="ml-2 text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
        >
          공연 #{r.performanceId}
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{r.reporterNickName}</TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(r.createDate)}
      </TableCell>
      <TableCell>
        <Badge variant={reportStatusVariant[r.status]}>{reportStatusLabel[r.status]}</Badge>
      </TableCell>
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
              <Skeleton className="h-4 w-full max-w-32" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
