"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";

async function postLogout(): Promise<{ ok: boolean }> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) {
    throw new Error("로그아웃 요청이 실패했습니다.");
  }
  return res.json();
}

/**
 * 로그아웃 mutation hook.
 * 성공 시 TanStack Query 캐시를 비워 stale 데이터를 남기지 않는다.
 * 라우팅은 호출부에서 처리.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: postLogout,
    onSettled: () => {
      queryClient.clear();
    },
  });
}
