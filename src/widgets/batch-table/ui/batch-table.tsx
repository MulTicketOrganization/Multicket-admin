"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

import {
  isRestartable,
  useJobInstances,
  type JobInstanceSummary,
} from "@/entities/batch";
import { RestartJobButton } from "@/features/batch-restart";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { formatDateTime } from "@/shared/lib/format";

export function BatchTable() {
  const [onlyIncomplete, setOnlyIncomplete] = useState(true);
  const { data, isPending, isError, error, refetch, isFetching } =
    useJobInstances(onlyIncomplete);

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
          <input
            type="checkbox"
            checked={onlyIncomplete}
            onChange={(e) => setOnlyIncomplete(e.target.checked)}
            className="size-4 accent-foreground"
          />
          미완료 배치만 보기
        </Label>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={isFetching ? "animate-spin" : undefined} />
          새로고침
        </Button>
      </div>

      {isPending ? (
        <Skeleton className="h-56 w-full rounded-lg" />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <AlertTriangle className="size-6 text-destructive" />
            <p className="text-sm">
              {error instanceof Error ? error.message : "배치 목록을 불러오지 못했습니다."}
            </p>
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="size-6" />}
          title={onlyIncomplete ? "미완료된 배치가 없습니다." : "배치 실행 이력이 없습니다."}
          description={
            onlyIncomplete
              ? "모든 배치가 정상적으로 완료되었습니다. 전체 이력을 보려면 필터를 해제하세요."
              : undefined
          }
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Instance</TableHead>
                <TableHead>Job 이름</TableHead>
                <TableHead className="w-32">상태</TableHead>
                <TableHead className="w-44">시작</TableHead>
                <TableHead className="w-44">종료</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((job) => (
                <JobRow key={job.jobInstanceId} job={job} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function JobRow({ job }: { job: JobInstanceSummary }) {
  const restartable = isRestartable(job.status);
  const running = job.endTime == null && !restartable;

  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">
        #{job.jobInstanceId}
      </TableCell>
      <TableCell className="font-mono text-sm">{job.jobName}</TableCell>
      <TableCell>
        <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(job.startTime)}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {job.endTime ? formatDateTime(job.endTime) : running ? "실행 중" : "-"}
      </TableCell>
      <TableCell className="text-right">
        <RestartJobButton job={job} disabled={!restartable} />
      </TableCell>
    </TableRow>
  );
}

function statusVariant(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "FAILED" || status === "ABANDONED") return "destructive" as const;
  if (status === "STARTED" || status === "STARTING") return "warning" as const;
  return "muted" as const;
}
