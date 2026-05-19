"use client";

import { useState } from "react";
import { Pencil, AlertTriangle } from "lucide-react";

import {
  MemberStatus,
  MemberType,
  genderLabel,
  loginTypeLabel,
  memberStatusLabel,
  memberTypeLabel,
  useMemberDetail,
  type MemberDetail,
} from "@/entities/member";
import { ChangeStatusDialog } from "@/features/member-change-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge, type BadgeProps } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDate, formatDateTime } from "@/shared/lib/format";

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

function formatBirthday(year: number | null, month: number | null, day: number | null): string {
  if (year == null && month == null && day == null) return "-";
  const y = year ?? "----";
  const m = month != null ? String(month).padStart(2, "0") : "--";
  const d = day != null ? String(day).padStart(2, "0") : "--";
  return `${y}.${m}.${d}`;
}

export function MemberDetailCard({ memberId }: { memberId: number }) {
  const { data, isPending, isError, error } = useMemberDetail(memberId);

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
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
            {error instanceof Error ? error.message : "회원 정보를 불러오지 못했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <MemberDetailContent member={data} />;
}

function MemberDetailContent({ member }: { member: MemberDetail }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="space-y-6 py-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {member.profileUrl && (
                  <AvatarImage src={member.profileUrl} alt={member.nickName} />
                )}
                <AvatarFallback>{member.nickName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">{member.nickName}</h2>
                  {member.deleted && (
                    <Badge variant="destructive" className="text-[10px]">삭제됨</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant={typeVariant(member.memberType)}>
                    {memberTypeLabel[member.memberType]}
                  </Badge>
                  <Badge variant={statusVariant(member.memberStatus)}>
                    {memberStatusLabel[member.memberStatus]}
                  </Badge>
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              <Pencil />
              상태 변경
            </Button>
          </header>

          <Separator />

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <DetailField label="회원 ID" value={String(member.id)} mono />
            <DetailField label="로그인 방식" value={loginTypeLabel[member.loginType]} />
            <DetailField
              label="성별"
              value={member.gender ? genderLabel[member.gender] : "-"}
            />
            <DetailField
              label="생년월일"
              value={formatBirthday(member.year, member.month, member.day)}
            />
            <DetailField label="가입일" value={formatDate(member.createDate)} />
            <DetailField label="마지막 수정일" value={formatDate(member.updateDate)} />
            <DetailField label="마지막 로그인" value={formatDateTime(member.lastLoginAt)} />
          </dl>
        </CardContent>
      </Card>

      <ChangeStatusDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        memberId={member.id}
        memberNickname={member.nickName}
        currentStatus={member.memberStatus}
      />
    </>
  );
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="w-28 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-xs" : ""}>{value}</dd>
    </div>
  );
}
