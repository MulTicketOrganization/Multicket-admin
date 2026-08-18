"use client";

import Link from "next/link";
import { Loader2, Ticket } from "lucide-react";

import { MemberType, useMemberDetail } from "@/entities/member";
import {
  flattenPerformancePages,
  performanceRunState,
  runStateLabel,
  runStateVariant,
  usePerformanceList,
} from "@/entities/performance";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { formatDate } from "@/shared/lib/format";

/**
 * 창작자가 등록한 공연 목록.
 * /admin/performance/list 의 memberId 필터를 그대로 사용한다.
 *
 * 크리에이터가 아닌 회원에게는 아무것도 렌더하지 않는다 —
 * 회원 유형은 상세 응답에만 있으므로 페이지가 아니라 이 위젯이 직접 판단한다.
 * (useMemberDetail 은 회원 상세 카드와 같은 query key 라 재요청이 발생하지 않는다)
 */
export function MemberPerformances({ memberId }: { memberId: number }) {
  const member = useMemberDetail(memberId);
  const isCreator = member.data?.memberType === MemberType.CREATOR;

  const query = usePerformanceList({ memberId });
  const rows = query.data ? flattenPerformancePages(query.data.pages) : [];

  if (!isCreator) return null;

  return (
    <Card>
      <CardContent className="space-y-3 py-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">등록 공연</h3>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/performances?memberId=${memberId}`}>공연 관리에서 보기</Link>
          </Button>
        </div>

        {query.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            공연 목록을 불러오지 못했습니다.
          </p>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Ticket className="size-5" />}
            title="등록한 공연이 없습니다"
            description={`${member.data?.nickName ?? "이 창작자"} 님이 등록한 공연이 아직 없습니다.`}
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>공연명</TableHead>
                    <TableHead className="w-40">장소</TableHead>
                    <TableHead className="w-48">기간</TableHead>
                    <TableHead className="w-24">상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => {
                    const runState = performanceRunState(p.startDate, p.endDate);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={`/performances/${p.id}`}
                            className="hover:text-primary hover:underline underline-offset-4"
                          >
                            {p.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.venueName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(p.startDate)} ~ {formatDate(p.endDate)}
                        </TableCell>
                        <TableCell>
                          {p.deleted ? (
                            <Badge variant="destructive">삭제됨</Badge>
                          ) : runState ? (
                            <Badge variant={runStateVariant[runState]}>
                              {runStateLabel[runState]}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {query.hasNextPage && (
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage && <Loader2 className="animate-spin" />}
                  더 보기
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
