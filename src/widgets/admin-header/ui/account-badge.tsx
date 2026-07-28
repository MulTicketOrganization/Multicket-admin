"use client";

import Link from "next/link";

import { useMe } from "@/entities/account";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";

/** 헤더 우측의 로그인 계정 표시. 클릭 시 내 계정 페이지로 이동. */
export function AccountBadge() {
  const { data, isPending } = useMe();

  if (isPending) {
    return <Skeleton className="h-8 w-24 rounded-md" />;
  }

  if (!data) return null;

  return (
    <Link
      href="/account"
      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent"
      title={data.email}
    >
      <Avatar className="size-6">
        {data.profileUrl && <AvatarImage src={data.profileUrl} alt={data.nickName} />}
        <AvatarFallback className="text-[10px]">
          {data.nickName.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      <span className="hidden max-w-32 truncate sm:inline">{data.nickName}</span>
    </Link>
  );
}
