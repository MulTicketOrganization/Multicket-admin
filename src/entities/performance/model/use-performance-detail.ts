"use client";

import { useQuery } from "@tanstack/react-query";

import { getPerformanceDetail } from "../api/get-performance-detail";

/**
 * 공연 상세 query hook.
 * performanceId 가 양의 정수일 때만 enabled.
 */
export function usePerformanceDetail(performanceId: number | null | undefined) {
  const valid =
    typeof performanceId === "number" && Number.isFinite(performanceId) && performanceId > 0;
  return useQuery({
    queryKey: ["admin", "performances", "detail", performanceId],
    queryFn: () => getPerformanceDetail(performanceId as number),
    enabled: valid,
  });
}

export const PERFORMANCE_QUERY_KEYS = {
  all: ["admin", "performances"] as const,
  list: () => [...PERFORMANCE_QUERY_KEYS.all, "list"] as const,
  detail: (id: number) => [...PERFORMANCE_QUERY_KEYS.all, "detail", id] as const,
};
