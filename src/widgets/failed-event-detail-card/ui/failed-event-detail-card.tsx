"use client";

import { AlertTriangle } from "lucide-react";

import {
  failedEventStatusLabel,
  failedEventStatusVariant,
  failedEventTypeLabel,
  formatPayload,
  useFailedEventDetail,
} from "@/entities/failed-event";
import { ResolveFailedEventButtons } from "@/features/failed-event-resolve";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateTime } from "@/shared/lib/format";

export function FailedEventDetailCard({ eventId }: { eventId: number }) {
  const { data, isPending, isError, error } = useFailedEventDetail(eventId);

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Separator />
          <Skeleton className="h-40 w-full" />
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
            {error instanceof Error ? error.message : "실패 이벤트를 불러오지 못했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 py-6">
        <header className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{failedEventTypeLabel[data.eventType]}</Badge>
          <Badge variant={failedEventStatusVariant[data.status]}>
            {failedEventStatusLabel[data.status]}
          </Badge>
        </header>

        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Field label="이벤트 ID" value={String(data.id)} mono />
          <Field label="대상" value={data.target || "-"} mono />
          <Field label="원본 큐" value={data.originQueue || "-"} mono />
          <Field label="발생 시각" value={formatDateTime(data.occurredAt)} />
          <Field label="DB 저장" value={formatDateTime(data.createDate)} />
          <Field label="설명" value={data.description || "-"} />
        </dl>

        <Separator />

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">실패 사유</h3>
          <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
            {data.failureReason || "기록된 사유가 없습니다."}
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">원본 payload</h3>
          <pre className="max-h-96 overflow-auto rounded-md border bg-muted/30 p-4 font-mono text-xs leading-relaxed">
            {formatPayload(data.payload)}
          </pre>
        </section>

        <div className="border-t pt-4">
          <ResolveFailedEventButtons event={data} />
        </div>
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
      <dd className={`min-w-0 break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
