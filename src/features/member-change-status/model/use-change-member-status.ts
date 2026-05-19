"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  MEMBER_QUERY_KEYS,
  changeMemberStatus,
  type MemberChangeRequest,
} from "@/entities/member";

/**
 * 회원 상태 변경 mutation.
 * 성공 시 해당 회원 상세 + 회원 목록 캐시를 invalidate.
 */
export function useChangeMemberStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "members", "change-status"],
    mutationFn: (req: MemberChangeRequest) => changeMemberStatus(req),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: MEMBER_QUERY_KEYS.detail(variables.memberId) });
      queryClient.invalidateQueries({ queryKey: MEMBER_QUERY_KEYS.list() });
    },
  });
}
