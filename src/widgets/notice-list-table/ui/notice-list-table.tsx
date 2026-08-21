"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  flattenNoticePages,
  isNoticeExpired,
  noticeTypeLabel,
  noticeTypeVariant,
  useNoticeList,
  type NoticeListItem,
} from "@/entities/notice";
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
import { useNoticeFilters } from "@/features/notice-list-filter";
import { formatDateTime } from "@/shared/lib/format";

const COLUMN_COUNT = 6;

export function NoticeListTable() {
  const { filters } = useNoticeFilters();
  const query = useNoticeList(filters);

  useEffect(() => {
    if (query.isError) {
      toast.error(
        query.error instanceof Error
          ? query.error.message
          : "공고 목록을 불러오지 못했습니다.",
      );
    }
  }, [query.isError, query.error]);

  const rows = query.data ? flattenNoticePages(query.data.pages) : [];

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-48">타입</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-40">등록일</TableHead>
            <TableHead className="w-40">만료</TableHead>
            <TableHead className="w-24">노출</TableHead>
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
                조건에 맞는 공고가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((n) => <NoticeRow key={n.id} notice={n} />)
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

function NoticeRow({ notice: n }: { notice: NoticeListItem }) {
  const router = useRouter();
  const href = `/notices/${n.id}`;
  const expired = isNoticeExpired(n.expireDate);

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
      <TableCell className="font-mono text-xs text-muted-foreground">{n.id}</TableCell>
      <TableCell>
        <Badge variant={noticeTypeVariant[n.type]}>{noticeTypeLabel[n.type]}</Badge>
      </TableCell>
      <TableCell className="font-medium">
        <Link
          href={href}
          className="text-foreground hover:text-primary hover:underline underline-offset-4"
        >
          {n.title}
        </Link>
        {n.writerEmail && (
          <span className="ml-2 text-xs text-muted-foreground">{n.writerEmail}</span>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(n.createDate)}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(n.expireDate)}
      </TableCell>
      <TableCell>
        <Badge variant={expired ? "muted" : "warning"}>{expired ? "만료" : "노출 중"}</Badge>
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
