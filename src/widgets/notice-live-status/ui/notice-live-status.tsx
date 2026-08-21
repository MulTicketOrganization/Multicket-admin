"use client";

import Link from "next/link";
import { BellRing, FileText } from "lucide-react";

import {
  NoticeType,
  STANDING_NOTICE_TYPES,
  noticePlatformLabel,
  noticeTypeDescription,
  noticeTypeLabel,
  updatePolicyLabel,
  useLatestNotice,
  useUrgentNotices,
} from "@/entities/notice";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDateTime } from "@/shared/lib/format";

/**
 * "지금 사용자에게 실제로 나가고 있는 것" 미리보기.
 * 관리자 목록(`/admin/notice`)이 이력 전체를 보여주는 것과 달리,
 * 여기는 공용 endpoint 를 그대로 호출해 앱과 같은 결과를 본다.
 */
export function NoticeLiveStatus() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">앱에 떠 있는 안내</h3>
        <UrgentNoticeCard />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">화면별 상시 공고</h3>
        <div className="grid gap-3">
          {STANDING_NOTICE_TYPES.map((t) => (
            <StandingNoticeCard key={t} type={t} />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * `GET /notice/urgent` 폴링 결과.
 *
 * ⚠️ 백엔드가 **요청자의 User-Agent 로 플랫폼을 판별**해 필터링하므로,
 * 브라우저에서 부르는 이 화면은 WEB / ALL 대상 공고만 본다.
 * iOS·Android 전용 공고는 여기 안 잡히니 목록 탭에서 확인해야 한다.
 */
function UrgentNoticeCard() {
  const { data, isPending, isError } = useUrgentNotices();
  const notices = data ?? [];

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            업데이트 · 긴급 공지 · 점검 안내 (폴링)
          </span>
          {notices.length > 0 && <Badge variant="warning">{notices.length}건 노출 중</Badge>}
        </div>

        {isPending ? (
          <Skeleton className="h-12 w-full" />
        ) : isError ? (
          <p className="text-xs text-muted-foreground">조회할 수 없습니다.</p>
        ) : notices.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            이 브라우저(WEB) 대상으로 나가는 안내가 없습니다. iOS·Android 전용 공고는
            여기 표시되지 않으니 아래 목록에서 확인하세요.
          </p>
        ) : (
          <ul className="space-y-3">
            {notices.map((n) => (
              <li key={n.id} className="space-y-1.5 rounded-md border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{noticeTypeLabel[n.type]}</Badge>
                  {n.updatePolicy && (
                    <Badge variant="warning">{updatePolicyLabel[n.updatePolicy]}</Badge>
                  )}
                  {n.targetPlatforms?.map((p) => (
                    <Badge key={p} variant="muted">
                      {noticePlatformLabel[p]}
                    </Badge>
                  ))}
                  <Link
                    href={`/notices/${n.id}`}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                  >
                    수정
                  </Link>
                </div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                  {n.content}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {n.maintenanceStartDate
                    ? `${formatDateTime(n.maintenanceStartDate)} ~ ${formatDateTime(n.expireDate)}`
                    : `${formatDateTime(n.expireDate)} 까지`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 타입별 최신 공고 미리보기 (`GET /notice?type=`).
 * 취소·환불 공고는 `performanceId` 분기가 기본이라 type 조회로는 비어 올 수 있다.
 */
function StandingNoticeCard({ type }: { type: NoticeType }) {
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
          <>
            <p className="text-sm font-medium">{data.title}</p>
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
              {data.content}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
