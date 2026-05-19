"use client";

import { useQuery } from "@tanstack/react-query";

import { getMemberDetail } from "../api/get-member-detail";

/**
 * 회원 상세 query hook.
 * memberId 가 NaN/0 이면 fetch 안 함.
 */
export function useMemberDetail(memberId: number | null | undefined) {
  const valid = typeof memberId === "number" && Number.isFinite(memberId) && memberId > 0;
  return useQuery({
    queryKey: ["admin", "members", "detail", memberId],
    queryFn: () => getMemberDetail(memberId as number),
    enabled: valid,
  });
}

/** detail / list 캐시 invalidate 시 사용할 베이스 키 */
export const MEMBER_QUERY_KEYS = {
  all: ["admin", "members"] as const,
  list: () => [...MEMBER_QUERY_KEYS.all, "list"] as const,
  detail: (id: number) => [...MEMBER_QUERY_KEYS.all, "detail", id] as const,
};
