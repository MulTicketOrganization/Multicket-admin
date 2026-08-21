"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Gavel } from "lucide-react";

import {
  isReportClosed,
  reportStatusLabel,
  reportStatusVariant,
  useReportDetail,
  type ReportDetail,
} from "@/entities/report";
import { ProcessReportDialog } from "@/features/report-process";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateTime } from "@/shared/lib/format";

export function ReportDetailCard({ reportId }: { reportId: number }) {
  const { data, isPending, isError, error } = useReportDetail(reportId);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Separator />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <AlertTriangle className="size-6 text-destructive" />
          <p className="text-sm">
            {error instanceof Error ? error.message : "신고를 불러오지 못했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const closed = isReportClosed(data.status);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-5 py-6">
          <header className="space-y-3">
            <Badge variant={reportStatusVariant[data.status]}>
              {reportStatusLabel[data.status]}
            </Badge>
            <h2 className="text-xl font-semibold tracking-tight">
              <Link
                href={`/performances/${data.performanceId}`}
                className="inline-flex items-center gap-1.5 hover:text-primary hover:underline underline-offset-4"
              >
                {data.performanceTitle}
                <ExternalLink className="size-4" />
              </Link>
            </h2>
            <p className="text-xs text-muted-foreground">
              공연에 대해 접수된 신고입니다. 처리 완료로 종료해도 공연이 자동으로
              삭제되지는 않습니다 — 실제 조치는 공연 관리에서 별도로 진행하세요.
            </p>
          </header>

          <Separator />

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Field label="신고 ID" value={String(data.id)} mono />
            <Field label="접수일" value={formatDateTime(data.createDate)} />
            <Field
              label="신고자"
              value={
                <Link
                  href={`/members/${data.reporterId}`}
                  className="hover:text-primary hover:underline underline-offset-4"
                >
                  {data.reporterNickName}
                </Link>
              }
            />
            <Field label="신고자 이메일" value={data.reporterEmail} />
            <Field
              label="대상 창작자"
              value={
                data.creatorId != null ? (
                  <Link
                    href={`/members/${data.creatorId}`}
                    className="hover:text-primary hover:underline underline-offset-4"
                  >
                    {data.creatorNickName ?? `#${data.creatorId}`}
                  </Link>
                ) : (
                  "-"
                )
              }
            />
            <Field
              label="대상 공연"
              value={
                <Link
                  href={`/performances/${data.performanceId}`}
                  className="inline-flex items-center gap-1 hover:text-primary hover:underline underline-offset-4"
                >
                  #{data.performanceId}
                  <ExternalLink className="size-3" />
                </Link>
              }
            />
          </dl>

          <Separator />

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">신고 사유</h3>
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
              {data.reason}
            </p>
          </section>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {closed && (
              <span className="text-xs text-muted-foreground">
                이미 종료된 신고는 다시 처리할 수 없습니다.
              </span>
            )}
            <Button onClick={() => setDialogOpen(true)} disabled={closed}>
              <Gavel />
              신고 처리
            </Button>
          </div>
        </CardContent>
      </Card>

      <HandlingCard report={data} />

      {!closed && (
        <ProcessReportDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          report={data}
        />
      )}
    </div>
  );
}

/** 처리 이력 — 처리 전에는 handledBy/opinion/handledAt 이 모두 null 이라 표시하지 않는다. */
function HandlingCard({ report }: { report: ReportDetail }) {
  if (!report.handledAt && !report.opinion) return null;

  return (
    <Card>
      <CardContent className="space-y-3 py-5">
        <h3 className="text-sm font-semibold">처리 이력</h3>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Field
            label="처리자"
            value={
              report.handledById != null ? (
                <Link
                  href={`/members/${report.handledById}`}
                  className="hover:text-primary hover:underline underline-offset-4"
                >
                  {report.handledByNickName ?? `#${report.handledById}`}
                </Link>
              ) : (
                "-"
              )
            }
          />
          <Field label="처리일시" value={formatDateTime(report.handledAt)} />
        </dl>
        {report.opinion && (
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              관리자 소견
            </p>
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
              {report.opinion}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="w-28 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={`min-w-0 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
