"use client";

import { BellRing, FileText } from "lucide-react";

import {
  NoticeType,
  POLLING_NOTICE_TYPES,
  isNoticeExpired,
  noticeTypeDescription,
  noticeTypeLabel,
  useLatestNotice,
  useUrgentNotice,
} from "@/entities/notice";
import { NoticeCreateForm } from "@/features/notice-create";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateTime } from "@/shared/lib/format";

/** GET /notice?type= 로 조회되는 상시 공고 타입 */
const STANDING_NOTICE_TYPES = Object.values(NoticeType).filter(
  (t) => !POLLING_NOTICE_TYPES.includes(t),
);

export function NoticeManager() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-5">
          <header className="space-y-1">
            <h3 className="text-sm font-semibold">공고 등록</h3>
            <p className="text-xs text-muted-foreground">
              등록 즉시 해당 타입의 최신 공고로 사용자에게 노출됩니다.
            </p>
          </header>
          <NoticeCreateForm />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">앱에 떠 있는 안내</h3>
        <UrgentNoticeCard />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">현재 게시 중인 공고</h3>
        <div className="grid gap-3">
          {STANDING_NOTICE_TYPES.map((t) => (
            <CurrentNoticeCard key={t} type={t} />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * 앱 업데이트 / 긴급 점검 안내.
 * 이 두 타입은 `GET /notice?type=` 으로 조회되지 않고 앱과 동일하게
 * `GET /notice/urgent` 폴링 결과로만 확인할 수 있다.
 */
function UrgentNoticeCard() {
  const { data, isPending, isError } = useUrgentNotice();
  const expired = isNoticeExpired(data?.expireDate);

  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BellRing className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">앱 업데이트 · 긴급 점검 안내</span>
            {data && !expired && <Badge variant="warning">노출 중</Badge>}
          </div>
          {data?.expireDate && (
            <span className="text-xs text-muted-foreground">
              {formatDateTime(data.expireDate)} 까지
            </span>
          )}
        </div>

        {isPending ? (
          <Skeleton className="h-12 w-full" />
        ) : isError ? (
          <p className="text-xs text-muted-foreground">조회할 수 없습니다.</p>
        ) : !data?.content ? (
          <p className="text-xs text-muted-foreground">
            지금 앱에 떠 있는 안내가 없습니다. 위 폼에서 &ldquo;앱 업데이트 안내&rdquo; 또는
            &ldquo;긴급 점검 안내&rdquo; 를 등록하면 여기에 표시됩니다.
          </p>
        ) : (
          <>
            <Badge variant="secondary">{noticeTypeLabel[data.type]}</Badge>
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
              {data.content}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 타입별 최신 공고 미리보기.
 * `/admin` 에는 공고 조회 API 가 없어 공용 `GET /notice` 를 쓴다 —
 * 취소·환불 공고는 공연 단위 조회가 기본이라 값이 비어 올 수 있다.
 */
function CurrentNoticeCard({ type }: { type: NoticeType }) {
  const { data, isPending, isError } = useLatestNotice(type);

  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{noticeTypeLabel[type]}</span>
          </div>
          {data?.createDate && (
            <span className="text-xs text-muted-foreground">
              {formatDateTime(data.createDate)} 등록
            </span>
          )}
        </div>

        {isPending ? (
          <Skeleton className="h-12 w-full" />
        ) : isError ? (
          <p className="text-xs text-muted-foreground">
            조회할 수 없습니다. (권한 또는 조회 조건 문제일 수 있습니다)
          </p>
        ) : !data?.content ? (
          <p className="text-xs text-muted-foreground">
            등록된 공고가 없습니다. {noticeTypeDescription[type]}
          </p>
        ) : (
          <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
            {data.content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
