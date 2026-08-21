import { apiFetch } from "@/shared/api";
import type { PerformanceStatistics } from "../model/types";

/**
 * GET /admin/performance/{performanceId}/statistics
 *
 * 공연 상세(`/admin/performance/detail`)와는 별개의 API로, 총 예매/취소/매출과
 * 회차별 예매 현황을 돌려준다. 상세 화면에서 필요할 때만 추가 호출한다.
 */
export async function getPerformanceStatistics(
  performanceId: number,
): Promise<PerformanceStatistics> {
  return apiFetch<PerformanceStatistics>(
    `/admin/performance/${performanceId}/statistics`,
    { method: "GET" },
  );
}
