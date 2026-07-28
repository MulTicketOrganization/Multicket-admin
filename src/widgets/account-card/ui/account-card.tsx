"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

import { useMe } from "@/entities/account";
import {
  genderLabel,
  loginTypeLabel,
  memberStatusLabel,
  memberStatusVariant,
  memberTypeLabel,
  memberTypeVariant,
} from "@/entities/member";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDate, formatDateTime } from "@/shared/lib/format";

export function AccountCard() {
  const { data, isPending, isError, error } = useMe();

  if (isPending) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
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
            {error instanceof Error ? error.message : "내 정보를 불러오지 못했습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 py-6">
        <header className="flex items-center gap-4">
          <Avatar className="size-16">
            {data.profileUrl && <AvatarImage src={data.profileUrl} alt={data.nickName} />}
            <AvatarFallback className="text-lg">
              {data.nickName.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {data.nickName}
            </h2>
            <p className="truncate text-sm text-muted-foreground">{data.email}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant={memberTypeVariant[data.memberType]}>
                {memberTypeLabel[data.memberType]}
              </Badge>
              <Badge variant={memberStatusVariant[data.memberStatus]}>
                {memberStatusLabel[data.memberStatus]}
              </Badge>
            </div>
          </div>
        </header>

        <p className="flex items-start gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          관리자 화면은 MASTER 권한 계정만 접근할 수 있습니다. 권한 변경은 API 로 제공되지
          않아 백엔드에서 직접 처리해야 합니다.
        </p>

        <Separator />

        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Field label="로그인 방식" value={loginTypeLabel[data.loginType]} />
          <Field label="성별" value={data.gender ? genderLabel[data.gender] : "-"} />
          <Field label="생년월일" value={formatBirthday(data.year, data.month, data.day)} />
          <Field label="선호 지역" value={data.area ?? "-"} />
          <Field
            label="선호 장르"
            value={data.genres && data.genres.length > 0 ? data.genres.join(", ") : "-"}
            full
          />
          <Field label="가입일" value={formatDate(data.createDate)} />
          <Field label="마지막 로그인" value={formatDateTime(data.lastLoginAt)} />
        </dl>
      </CardContent>
    </Card>
  );
}

function formatBirthday(
  year: number | null,
  month: number | null,
  day: number | null,
): string {
  if (year == null && month == null && day == null) return "-";
  const y = year != null ? `${year}년` : "";
  const m = month != null ? ` ${month}월` : "";
  const d = day != null ? ` ${day}일` : "";
  return `${y}${m}${d}`.trim() || "-";
}

function Field({
  label,
  value,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
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
      <dd className="min-w-0">{value}</dd>
    </div>
  );
}
