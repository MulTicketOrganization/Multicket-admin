"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  failedEventStatusLabel,
  failedEventStatusVariant,
  flattenFailedEventPages,
  formatEventType,
  useFailedEventList,
  type FailedEventListItem,
} from "@/entities/failed-event";
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
import { useFailedEventFilters } from "@/features/failed-event-list-filter";
import { formatDateTime } from "@/shared/lib/format";

const COLUMN_COUNT = 5;

export function FailedEventListTable() {
  const { filters } = useFailedEventFilters();
  const query = useFailedEventList(filters);

  useEffect(() => {
    if (query.isError) {
      toast.error(
        query.error instanceof Error
          ? query.error.message
          : "이벤트 목록을 불러오지 못했습니다.",
      );
    }
  }, [query.isError, query.error]);

  const rows = query.data ? flattenFailedEventPages(query.data.pages) : [];

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-52">이벤트 타입</TableHead>
            <TableHead>이벤트 ID</TableHead>
            <TableHead className="w-40">발생 시각</TableHead>
            <TableHead className="w-24">상태</TableHead>
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
                조건에 맞는 이벤트가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((e) => <FailedEventRow key={e.id} event={e} />)
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

function FailedEventRow({ event: e }: { event: FailedEventListItem }) {
  const router = useRouter();
  const href = `/failed-events/${e.id}`;

  return (
    <TableRow
      className="cursor-pointer"
      onClick={(ev) => {
        if ((ev.target as HTMLElement).closest("a, button")) return;
        router.push(href);
      }}
      onKeyDown={(ev) => {
        if (ev.key === "Enter") router.push(href);
      }}
      tabIndex={0}
    >
      <TableCell className="font-mono text-xs text-muted-foreground">{e.id}</TableCell>
      <TableCell>
        <Badge variant="secondary">{formatEventType(e.eventType)}</Badge>
      </TableCell>
      <TableCell className="font-medium">
        <Link
          href={href}
          className="font-mono text-xs text-foreground hover:text-primary hover:underline underline-offset-4"
        >
          {e.eventId || "-"}
        </Link>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(e.occurredAt)}
      </TableCell>
      <TableCell>
        <Badge variant={failedEventStatusVariant[e.status]}>
          {failedEventStatusLabel[e.status]}
        </Badge>
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
