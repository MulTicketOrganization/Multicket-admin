"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  flattenInquiryPages,
  inquiryRefHref,
  inquiryStatusLabel,
  inquiryStatusVariant,
  inquiryTypeLabel,
  useInquiryList,
  type InquiryListItem,
} from "@/entities/inquiry";
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
import { useInquiryFilters } from "@/features/inquiry-list-filter";
import { formatDateTime } from "@/shared/lib/format";

const COLUMN_COUNT = 6;

export function InquiryListTable() {
  const { filters } = useInquiryFilters();
  const query = useInquiryList(filters);

  useEffect(() => {
    if (query.isError) {
      toast.error(
        query.error instanceof Error
          ? query.error.message
          : "문의 목록을 불러오지 못했습니다.",
      );
    }
  }, [query.isError, query.error]);

  const rows = query.data ? flattenInquiryPages(query.data.pages) : [];

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-28">유형</TableHead>
            <TableHead className="w-32">작성자</TableHead>
            <TableHead className="w-40">생성일</TableHead>
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
                조건에 맞는 문의가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((i) => <InquiryRow key={i.id} inquiry={i} />)
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

function InquiryRow({ inquiry: i }: { inquiry: InquiryListItem }) {
  const router = useRouter();
  const href = `/inquiries/${i.id}`;
  const refHref = inquiryRefHref(i.inquiryType, i.inquiryRefId);

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
      <TableCell className="font-mono text-xs text-muted-foreground">{i.id}</TableCell>
      <TableCell className="font-medium">
        <Link
          href={href}
          className="text-foreground hover:text-primary hover:underline underline-offset-4"
        >
          {i.title}
        </Link>
        {refHref && (
          <Link
            href={refHref}
            className="ml-2 text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
          >
            연관 #{i.inquiryRefId}
          </Link>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{inquiryTypeLabel[i.inquiryType]}</Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{i.writerNickName}</TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(i.createDate)}
      </TableCell>
      <TableCell>
        <Badge variant={inquiryStatusVariant[i.inquiryStatus]}>
          {inquiryStatusLabel[i.inquiryStatus]}
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
