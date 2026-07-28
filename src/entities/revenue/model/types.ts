/**
 * 월별 크리에이터 매출 도메인.
 * 출처: GET /admin/revenue/monthly?year&month
 * 해당 월(1일~말일) 기준 크리에이터별·공연별 결제/취소 총액.
 */

export interface MonthlyPerformanceRevenue {
  performanceId: number;
  performanceTitle: string;
  paymentAmount: number;
  cancelAmount: number;
}

export interface MonthlyCreatorRevenue {
  creatorId: number;
  creatorEmail: string | null;
  creatorPhone: string | null;
  creatorNickName: string | null;
  totalPaymentAmount: number;
  totalCancelAmount: number;
  performances: MonthlyPerformanceRevenue[] | null;
}

/** 결제 - 취소 = 순매출 */
export function netAmount(payment: number, cancel: number): number {
  return payment - cancel;
}

/** 전체 합계 (테이블 푸터용) */
export function sumRevenue(rows: MonthlyCreatorRevenue[]) {
  return rows.reduce(
    (acc, r) => ({
      payment: acc.payment + (r.totalPaymentAmount ?? 0),
      cancel: acc.cancel + (r.totalCancelAmount ?? 0),
    }),
    { payment: 0, cancel: 0 },
  );
}
