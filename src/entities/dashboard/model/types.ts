/**
 * 대시보드 요약 (GET /admin/dashboard).
 *
 * 이전에는 목록 API 첫 페이지(10건)를 세어 "10+" 로 표기했는데,
 * 백엔드에 집계 API 가 생겨 정확한 총계를 쓸 수 있게 됐다.
 */
export interface DashboardSummary {
  /** 오늘 생성되어 SUCCESS 처리된 주문 수 (무료·100% 할인 즉시 확정분 포함) */
  todaySalesCount: number;
  /** 오늘 SUCCESS/CANCEL 처리된 주문의 paidAmount 합계 — 취소분이 반영된 순매출 */
  todayRevenue: number;
  /** memberType == AUDIENCE && memberStatus != DELETED */
  activeAudienceCount: number;
  /** memberType == CREATOR && memberStatus != DELETED */
  activeCreatorCount: number;
  /** memberType == CREATOR && memberStatus == PENDING */
  pendingCreatorCount: number;
  /** 삭제되지 않고 현재 판매 기간에 걸쳐 있는 공연 수 */
  onSalePerformanceCount: number;
}
