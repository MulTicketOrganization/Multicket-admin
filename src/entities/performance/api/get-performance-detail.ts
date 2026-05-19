import { apiFetch } from "@/shared/api";
import type { PerformanceDetail } from "../model/types";

/**
 * GET /admin/performance/detail?performanceId={id}
 */
export async function getPerformanceDetail(performanceId: number): Promise<PerformanceDetail> {
  return apiFetch<PerformanceDetail>("/admin/performance/detail", {
    method: "GET",
    query: { performanceId },
  });
}
