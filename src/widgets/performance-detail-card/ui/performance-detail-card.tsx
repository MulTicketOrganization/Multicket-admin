"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, Ticket } from "lucide-react";

import {
  CastStaff,
  castStaffLabel,
  ticketTypeLabel,
  usePerformanceDetail,
  type CrewInfo,
  type PerformanceDetail,
  type TicketDate,
  type TicketInfo,
} from "@/entities/performance";
import {
  MemberStatus,
  MemberType,
  memberStatusLabel,
  memberTypeLabel,
} from "@/entities/member";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge, type BadgeProps } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDate, formatDateTime, formatPrice } from "@/shared/lib/format";

function memberStatusVariant(s: MemberStatus): BadgeProps["variant"] {
  switch (s) {
    case MemberStatus.COMPLETE:
      return "success";
    case MemberStatus.PENDING:
      return "warning";
    case MemberStatus.FROZEN:
      return "destructive";
  }
}

function memberTypeVariant(t: MemberType): BadgeProps["variant"] {
  switch (t) {
    case MemberType.MASTER:
      return "default";
    case MemberType.CREATOR:
      return "secondary";
    case MemberType.AUDIENCE:
      return "muted";
  }
}

export function PerformanceDetailCard({ performanceId }: { performanceId: number }) {
  const { data, isPending, isError, error } = usePerformanceDetail(performanceId);

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex gap-4">
            <Skeleton className="h-32 w-24 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full max-w-48" />
            ))}
          </div>
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
            {error instanceof Error ? error.message : "공연 정보를 불러오지 못했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <MainCard performance={data} />
      <WriterCard performance={data} />
      <CrewCard crewInfos={data.crewInfos} />
      <TicketCard performance={data} />
    </div>
  );
}

/* ============================== Sections ============================== */

function MainCard({ performance: p }: { performance: PerformanceDetail }) {
  return (
    <Card>
      <CardContent className="space-y-6 py-6">
        <header className="flex flex-col gap-4 sm:flex-row">
          <div className="shrink-0">
            {p.posterUrl ? (
              // 외부 도메인 이미지를 자유롭게 표시하기 위해 next/image 대신 img 사용
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.posterUrl}
                alt={`${p.title} 포스터`}
                className="h-40 w-28 rounded-md object-cover border bg-muted"
              />
            ) : (
              <div className="flex h-40 w-28 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                no poster
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight">{p.title}</h2>
              {p.deleted && (
                <Badge variant="destructive" className="text-[10px]">삭제됨</Badge>
              )}
              {p.isOpenRun && (
                <Badge variant="warning" className="text-[10px]">오픈런</Badge>
              )}
              {p.isDaeHakRo && (
                <Badge variant="muted" className="text-[10px]">대학로</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {p.genre && <Badge variant="secondary">{p.genre}</Badge>}
              {p.area && <Badge variant="outline">{p.area}</Badge>}
            </div>

            <p className="text-sm text-muted-foreground">{p.venueName}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              {formatDate(p.startDate)} ~ {formatDate(p.endDate)}
            </p>
          </div>
        </header>

        <Separator />

        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <DetailField label="공연 ID" value={String(p.performanceId)} mono />
          <DetailField label="KOPIS ID" value={p.kopisId ?? "-"} mono />
          <DetailField label="가격" value={formatPrice(p.price)} />
          <DetailField label="관람 연령" value={p.ageLimit != null ? `${p.ageLimit}세 이상` : "-"} />
          <DetailField label="러닝타임" value={p.runTime ?? "-"} />
          <DetailField label="등록일" value={formatDate(p.createDate)} />
          <DetailField label="마지막 수정" value={formatDate(p.updateDate)} />
          <DetailField label="KOPIS 동기화" value={formatDateTime(p.syncedAt)} />
          {p.ticketLink && (
            <DetailField
              label="외부 티켓"
              value={
                <a
                  href={p.ticketLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-4 break-all"
                >
                  {p.ticketLink}
                </a>
              }
              full
            />
          )}
        </dl>

        {p.synopsis && (
          <>
            <Separator />
            <section className="space-y-2">
              <SectionTitle>시놉시스</SectionTitle>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {p.synopsis}
              </p>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WriterCard({ performance: p }: { performance: PerformanceDetail }) {
  if (p.memberId == null) return null;

  return (
    <Card>
      <CardContent className="py-5">
        <SectionTitle className="mb-3">작성자</SectionTitle>
        <div className="flex items-center gap-4">
          <Avatar className="size-10">
            <AvatarFallback>
              {(p.memberNickname ?? "?").slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Link
              href={`/members/${p.memberId}`}
              className="text-sm font-medium hover:text-primary hover:underline underline-offset-4"
            >
              {p.memberNickname ?? `회원 #${p.memberId}`}
            </Link>
            {p.memberEmail && (
              <p className="text-xs text-muted-foreground">{p.memberEmail}</p>
            )}
            <div className="flex gap-1.5 pt-1">
              {p.memberType && (
                <Badge variant={memberTypeVariant(p.memberType)} className="text-[10px]">
                  {memberTypeLabel[p.memberType]}
                </Badge>
              )}
              {p.memberStatus && (
                <Badge variant={memberStatusVariant(p.memberStatus)} className="text-[10px]">
                  {memberStatusLabel[p.memberStatus]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CrewCard({ crewInfos }: { crewInfos: CrewInfo[] | null }) {
  if (!crewInfos || crewInfos.length === 0) return null;

  const cast = crewInfos.filter((c) => c.castStaff === CastStaff.CAST);
  const staff = crewInfos.filter((c) => c.castStaff === CastStaff.STAFF);

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <SectionTitle>크루 ({crewInfos.length})</SectionTitle>
        {cast.length > 0 && <CrewGroup label={castStaffLabel[CastStaff.CAST]} members={cast} />}
        {staff.length > 0 && (
          <CrewGroup label={castStaffLabel[CastStaff.STAFF]} members={staff} />
        )}
      </CardContent>
    </Card>
  );
}

function CrewGroup({ label, members }: { label: string; members: CrewInfo[] }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">
        {label} ({members.length})
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((m, i) => (
          <div
            key={`${m.name}-${i}`}
            className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5"
          >
            <Avatar className="size-7">
              {m.imgUrl && <AvatarFallback />}
              <AvatarFallback className="text-[10px]">{m.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketCard({ performance: p }: { performance: PerformanceDetail }) {
  const hasTicket =
    p.amount != null ||
    p.amountLeft != null ||
    (p.ticketInfos && p.ticketInfos.length > 0) ||
    (p.ticketDates && p.ticketDates.length > 0);

  if (!hasTicket) return null;

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <SectionTitle className="flex items-center gap-1.5">
          <Ticket className="size-4" />
          티켓 정보
        </SectionTitle>

        {(p.amount != null || p.amountLeft != null) && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="총 좌석" value={p.amount?.toLocaleString("ko-KR") ?? "-"} />
            <Stat label="잔여 좌석" value={p.amountLeft?.toLocaleString("ko-KR") ?? "-"} />
          </div>
        )}

        {p.ticketInfos && p.ticketInfos.length > 0 && (
          <section className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">
              가격 ({p.ticketInfos.length})
            </div>
            <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
              {p.ticketInfos.map((t) => (
                <TicketInfoRow key={t.id} info={t} />
              ))}
            </ul>
          </section>
        )}

        {p.ticketDates && p.ticketDates.length > 0 && (
          <section className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">
              회차 ({p.ticketDates.length})
            </div>
            <ul className="flex flex-wrap gap-1.5 text-xs">
              {p.ticketDates.map((d) => (
                <TicketDateRow key={d.id} date={d} />
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}

function TicketInfoRow({ info }: { info: TicketInfo }) {
  return (
    <li className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
      <span className="font-medium">{ticketTypeLabel[info.ticketType]}</span>
      <span className="text-muted-foreground">{formatPrice(info.price)}</span>
    </li>
  );
}

function TicketDateRow({ date }: { date: TicketDate }) {
  return (
    <li className="rounded border bg-muted/40 px-2 py-1 text-muted-foreground">
      {formatDateTime(date.enableDate)}
    </li>
  );
}

/* ============================== Atoms ============================== */

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={`text-sm font-semibold ${className}`}>{children}</h3>;
}

function DetailField({
  label,
  value,
  mono = false,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <dt className="w-28 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={`min-w-0 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
