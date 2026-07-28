"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "../api/get-me";

export const ACCOUNT_QUERY_KEYS = {
  me: () => ["admin", "account", "me"] as const,
};

/** 로그인한 관리자 본인 정보. 헤더/계정 페이지에서 공유된다. */
export function useMe() {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.me(),
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
