"use client";

import { AlertCircle } from "lucide-react";

import {
  isNoticeExpired,
  noticePlatformLabel,
  noticeTypeLabel,
  noticeTypeVariant,
  updatePolicyLabel,
  useNoticeDetail,
} from "@/entities/notice";
import { NoticeDeleteButton, NoticeForm } from "@/features/notice-write";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateTime } from "@/shared/lib/format";

export function NoticeDetailCard({ noticeId }: { noticeId: number }) {
  const { data, isPending, isError, error } = useNoticeDetail(noticeId);

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-3 py-5">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="공고를 불러오지 못했습니다."
        description={error instanceof Error ? error.message : undefined}
      />
    );
  }

  const expired = isNoticeExpired(data.expireDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={noticeTypeVariant[data.type]}>{noticeTypeLabel[data.type]}</Badge>
            <Badge variant={expired ? "muted" : "warning"}>
              {expired ? "만료" : "노출 중"}
            </Badge>
            {data.updatePolicy && (
              <Badge variant="secondary">{updatePolicyLabel[data.updatePolicy]}</Badge>
            )}
            {data.targetPlatforms?.map((p) => (
              <Badge key={p} variant="muted">
                {noticePlatformLabel[p]}
              </Badge>
            ))}
            <div className="ml-auto">
              <NoticeDeleteButton noticeId={data.id} noticeTitle={data.title} />
            </div>
          </div>

          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Field label="등록일" value={formatDateTime(data.createDate)} />
            <Field label="수정일" value={formatDateTime(data.updateDate)} />
            <Field
              label={data.maintenanceStartDate ? "점검 종료(만료)" : "만료 시각"}
              value={formatDateTime(data.expireDate)}
            />
            {data.maintenanceStartDate && (
              <Field
                label="점검 시작"
                value={formatDateTime(data.maintenanceStartDate)}
              />
            )}
            <Field
              label="작성자"
              value={data.writerEmail ?? "기록 없음 (마이그레이션 이전 공고)"}
            />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 py-5">
          <header className="space-y-1">
            <h3 className="text-sm font-semibold">공고 수정</h3>
            <p className="text-xs text-muted-foreground">
              기존 행을 그대로 수정합니다 — 새 이력이 쌓이지 않고 사용자에게 즉시 반영됩니다.
            </p>
          </header>
          {/* key 로 마운트를 고정해야 조회 완료 후 초기값이 폼에 반영된다 */}
          <NoticeForm key={data.id} notice={data} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </div>
  );
}
