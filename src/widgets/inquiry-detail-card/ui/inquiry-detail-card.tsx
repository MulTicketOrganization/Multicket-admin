"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Gavel } from "lucide-react";

import {
  inquiryRefHref,
  inquiryStatusLabel,
  inquiryStatusVariant,
  inquiryTypeDescription,
  inquiryTypeLabel,
  isInquiryClosed,
  useInquiryDetail,
  type InquiryDetail,
} from "@/entities/inquiry";
import { ProcessInquiryDialog } from "@/features/inquiry-process";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateTime } from "@/shared/lib/format";

export function InquiryDetailCard({ inquiryId }: { inquiryId: number }) {
  const { data, isPending, isError, error } = useInquiryDetail(inquiryId);
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
            {error instanceof Error ? error.message : "문의를 불러오지 못했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const closed = isInquiryClosed(data.inquiryStatus);
  const refHref = inquiryRefHref(data.inquiryType, data.inquiryRefId);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-5 py-6">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{inquiryTypeLabel[data.inquiryType]}</Badge>
              <Badge variant={inquiryStatusVariant[data.inquiryStatus]}>
                {inquiryStatusLabel[data.inquiryStatus]}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{data.title}</h2>
            <p className="text-xs text-muted-foreground">
              {inquiryTypeDescription[data.inquiryType]}
            </p>
          </header>

          <Separator />

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Field label="문의 ID" value={String(data.id)} mono />
            <Field
              label="작성자"
              value={
                <Link
                  href={`/members/${data.writerId}`}
                  className="hover:text-primary hover:underline underline-offset-4"
                >
                  {data.writerNickName}
                </Link>
              }
            />
            <Field label="작성자 이메일" value={data.writerEmail} />
            <Field
              label="연관 대상"
              value={
                refHref ? (
                  <Link
                    href={refHref}
                    className="inline-flex items-center gap-1 hover:text-primary hover:underline underline-offset-4"
                  >
                    #{data.inquiryRefId}
                    <ExternalLink className="size-3" />
                  </Link>
                ) : (
                  "-"
                )
              }
            />
            <Field label="생성일" value={formatDateTime(data.createDate)} />
            <Field label="최종 수정" value={formatDateTime(data.updateDate)} />
          </dl>

          <Separator />

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">문의 내용</h3>
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
              {data.description}
            </p>
          </section>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {closed && (
              <span className="text-xs text-muted-foreground">
                이미 종료된 문의는 다시 처리할 수 없습니다.
              </span>
            )}
            <Button onClick={() => setDialogOpen(true)} disabled={closed}>
              <Gavel />
              문의 처리
            </Button>
          </div>
        </CardContent>
      </Card>

      <RefDetailCard detail={data.refDetail} />

      {!closed && (
        <ProcessInquiryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          inquiry={data}
        />
      )}
    </div>
  );
}

/**
 * 연관 객체(refDetail) 는 문의 유형마다 스키마가 달라 백엔드가 free-form 으로 내려준다.
 * 타입을 특정할 수 없으므로 key/value 를 그대로 나열한다.
 */
function RefDetailCard({ detail }: { detail: InquiryDetail["refDetail"] }) {
  if (!detail || Object.keys(detail).length === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-3 py-5">
        <h3 className="text-sm font-semibold">연관 정보</h3>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {Object.entries(detail).map(([key, value]) => (
            <div key={key} className="flex gap-3">
              <dt className="w-32 shrink-0 truncate text-xs text-muted-foreground">
                {key}
              </dt>
              <dd className="min-w-0 break-words">{stringifyValue(value)}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function stringifyValue(value: unknown): string {
  if (value == null) return "-";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
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
