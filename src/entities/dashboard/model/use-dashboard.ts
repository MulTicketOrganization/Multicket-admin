"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardSummary } from "../api";

export const DASHBOARD_QUERY_KEYS = {
  summary: () => ["admin", "dashboard", "summary"] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.summary(),
    queryFn: () => getDashboardSummary(),
    // 운영 중 자주 바뀌는 값이라 창을 다시 볼 때 갱신한다
    staleTime: 60_000,
  });
}
