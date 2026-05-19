"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  MemberStatus,
  MemberType,
  type MemberListFilters,
} from "@/entities/member";

const KEY_KEYWORD = "keyword";
const KEY_TYPE = "type";
const KEY_STATUS = "status";

/** Select 의 "전체" 항목용 sentinel (빈 문자열 / undefined 는 Radix Select 가 거부) */
export const ALL_SENTINEL = "_all_";

function isMemberType(v: string | null): v is MemberType {
  return v != null && (Object.values(MemberType) as string[]).includes(v);
}

function isMemberStatus(v: string | null): v is MemberStatus {
  return v != null && (Object.values(MemberStatus) as string[]).includes(v);
}

interface Patch {
  keyword?: string | null;
  memberType?: MemberType | null;
  memberStatus?: MemberStatus | null;
}

/**
 * URL search params 를 source-of-truth 로 하는 회원 목록 필터 hook.
 * 동일 페이지의 filter UI 와 table 양쪽에서 호출해도 일관된 상태를 본다.
 */
export function useMemberFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const keywordParam = searchParams.get(KEY_KEYWORD) ?? "";
  const typeParam = searchParams.get(KEY_TYPE);
  const statusParam = searchParams.get(KEY_STATUS);

  const memberType = isMemberType(typeParam) ? typeParam : null;
  const memberStatus = isMemberStatus(statusParam) ? statusParam : null;

  const filters = useMemo<MemberListFilters>(
    () => ({
      keyword: keywordParam || undefined,
      memberType: memberType ?? undefined,
      memberStatus: memberStatus ?? undefined,
    }),
    [keywordParam, memberType, memberStatus],
  );

  const update = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(searchParams.toString());

      if (patch.keyword !== undefined) {
        if (patch.keyword) next.set(KEY_KEYWORD, patch.keyword);
        else next.delete(KEY_KEYWORD);
      }
      if (patch.memberType !== undefined) {
        if (patch.memberType) next.set(KEY_TYPE, patch.memberType);
        else next.delete(KEY_TYPE);
      }
      if (patch.memberStatus !== undefined) {
        if (patch.memberStatus) next.set(KEY_STATUS, patch.memberStatus);
        else next.delete(KEY_STATUS);
      }

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return {
    filters,
    keyword: keywordParam,
    memberType,
    memberStatus,
    update,
  };
}
