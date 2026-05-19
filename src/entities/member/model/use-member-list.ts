"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getMembers } from "../api/get-members";
import type { MemberListItem, MemberStatus, MemberType } from "./types";

export interface MemberListFilters {
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  keyword?: string;
}

/**
 * 회원 목록 cursor 페이지네이션 hook.
 * - pageParam = cursorId (초기값 0)
 * - 다음 cursor 는 현재 페이지 마지막 항목의 id
 * - hasNext=false 면 fetchNextPage 호출 시 더 이상 fetch 안 함
 */
export function useMemberList(filters: MemberListFilters) {
  return useInfiniteQuery({
    queryKey: ["admin", "members", "list", filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getMembers({
        cursorId: pageParam,
        memberType: filters.memberType,
        memberStatus: filters.memberStatus,
        keyword: filters.keyword,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || lastPage.data.length === 0) return undefined;
      return lastPage.data[lastPage.data.length - 1].id;
    },
  });
}

/** 페이지 배열을 단일 리스트로 flatten */
export function flattenMemberPages(
  pages: ReadonlyArray<{ data: MemberListItem[] }>,
): MemberListItem[] {
  return pages.flatMap((p) => p.data);
}
