"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  MemberStatus,
  MemberType,
  flattenMemberPages,
  loginTypeLabel,
  memberStatusLabel,
  memberTypeLabel,
  useMemberList,
  type MemberListItem,
} from "@/entities/member";
import { Badge, type BadgeProps } from "@/shared/ui/badge";
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
import { useMemberFilters } from "@/features/member-list-filter";
import { formatDate, formatDateTime } from "@/shared/lib/format";

const COLUMN_COUNT = 8;

function statusVariant(s: MemberStatus): BadgeProps["variant"] {
  switch (s) {
    case MemberStatus.COMPLETE:
      return "success";
    case MemberStatus.PENDING:
      return "warning";
    case MemberStatus.FROZEN:
      return "destructive";
  }
}

function typeVariant(t: MemberType): BadgeProps["variant"] {
  switch (t) {
    case MemberType.MASTER:
      return "default";
    case MemberType.CREATOR:
      return "secondary";
    case MemberType.AUDIENCE:
      return "muted";
  }
}

export function MemberListTable() {
  const { filters } = useMemberFilters();
  const query = useMemberList(filters);

  // 에러는 사용자에게 toast 로 알린다 (페이지 자체는 빈 상태로 유지)
  useEffect(() => {
    if (query.isError) {
      const msg = query.error instanceof Error ? query.error.message : "회원 목록을 불러오지 못했습니다.";
      toast.error(msg);
    }
  }, [query.isError, query.error]);

  const rows = query.data ? flattenMemberPages(query.data.pages) : [];
  const isInitialLoading = query.isPending;

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>닉네임</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead className="w-24">유형</TableHead>
            <TableHead className="w-28">상태</TableHead>
            <TableHead className="w-24">로그인</TableHead>
            <TableHead className="w-28">가입일</TableHead>
            <TableHead className="w-40">마지막 로그인</TableHead>
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
                조건에 맞는 회원이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((m) => <MemberRow key={m.id} member={m} />)
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
        <span>총 {rows.length}건 로드됨{query.hasNextPage ? " (더 있음)" : ""}</span>
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

function MemberRow({ member: m }: { member: MemberListItem }) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">{m.id}</TableCell>
      <TableCell className="font-medium">{m.nickName}</TableCell>
      <TableCell className="text-muted-foreground">{m.email}</TableCell>
      <TableCell>
        <Badge variant={typeVariant(m.memberType)}>{memberTypeLabel[m.memberType]}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant(m.memberStatus)}>
          {memberStatusLabel[m.memberStatus]}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {loginTypeLabel[m.loginType]}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{formatDate(m.createDate)}</TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(m.lastLoginAt)}
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
