"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  flattenPerformancePages,
  usePerformanceList,
  type PerformanceListItem,
} from "@/entities/performance";
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
import { usePerformanceFilters } from "@/features/performance-list-filter";
import { formatDate } from "@/shared/lib/format";

const COLUMN_COUNT = 7;

export function PerformanceListTable() {
  const { filters } = usePerformanceFilters();
  const query = usePerformanceList(filters);

  useEffect(() => {
    if (query.isError) {
      const msg =
        query.error instanceof Error
          ? query.error.message
          : "공연 목록을 불러오지 못했습니다.";
      toast.error(msg);
    }
  }, [query.isError, query.error]);

  const rows = query.data ? flattenPerformancePages(query.data.pages) : [];
  const isInitialLoading = query.isPending;

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-44">장소</TableHead>
            <TableHead className="w-28">장르</TableHead>
            <TableHead className="w-56">기간</TableHead>
            <TableHead className="w-36">작성자</TableHead>
            <TableHead className="w-20">상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isInitialLoading ? (
            <SkeletonRows count={6} />
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT}
                className="h-32 text-center text-sm text-muted-foreground"
              >
                조건에 맞는 공연이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((p) => <PerformanceRow key={p.id} performance={p} />)
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

function PerformanceRow({ performance: p }: { performance: PerformanceListItem }) {
  const router = useRouter();
  const href = `/performances/${p.id}`;

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    router.push(href);
  };

  return (
    <TableRow
      className="cursor-pointer"
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      tabIndex={0}
    >
      <TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell>
      <TableCell className="font-medium">
        <Link
          href={href}
          className="text-foreground hover:text-primary hover:underline underline-offset-4"
        >
          {p.title}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">{p.venueName}</TableCell>
      <TableCell>
        {p.genre ? (
          <Badge variant="secondary">{p.genre}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDate(p.startDate)} ~ {formatDate(p.endDate)}
      </TableCell>
      <TableCell className="text-xs">
        {p.memberId != null ? (
          <Link
            href={`/members/${p.memberId}`}
            className="hover:text-primary hover:underline underline-offset-4"
          >
            {p.memberNickname ?? `#${p.memberId}`}
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        {p.deleted ? (
          <Badge variant="destructive">삭제됨</Badge>
        ) : (
          <Badge variant="success">활성</Badge>
        )}
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
