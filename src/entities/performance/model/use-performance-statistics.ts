"use client";

import { useQuery } from "@tanstack/react-query";

import { getPerformanceStatistics } from "../api";
import { PERFORMANCE_QUERY_KEYS } from "./use-performance-detail";

export function usePerformanceStatistics(performanceId: number) {
  return useQuery({
    queryKey: [...PERFORMANCE_QUERY_KEYS.detail(performanceId), "statistics"],
    queryFn: () => getPerformanceStatistics(performanceId),
    enabled: Number.isFinite(performanceId) && performanceId > 0,
  });
}
