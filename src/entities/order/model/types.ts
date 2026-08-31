/**
 * 주문(Order) 도메인 — 관리자 조회.
 * 출처: /admin/order/** (Admin 태그)
 *
 * 목록은 **회원 단위**(`memberId` 필수)로만 조회할 수 있다. 전역 주문 목록 API 가
 * 없어 회원 상세에서만 진입한다. (BACKEND_REQUESTS.md — memberId optional 요청)
 */

export const TicketOrderStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAIL: "FAIL",
  CANCEL: "CANCEL",
} as const;
export type TicketOrderStatus =
  (typeof TicketOrderStatus)[keyof typeof TicketOrderStatus];

/** GET /admin/order/list 응답 항목 */
export interface OrderListItem {
  orderId: number;
  /** 예매번호 (PortOne paymentId) */
  paymentId: string;
  /** 결제 확정 시각. PENDING 등 미확정 주문은 null */
  paidAt: string | null;
  /** PortOne 실시간 조회 결과. 결제 기록이 없거나 조회 실패면 null */
  paymentMethod: string | null;
  buyerName: string | null;
  buyerEmail: string | null;
  /** 마스킹 없이 그대로 온다 — 화면에 노출할 때 주의 */
  buyerPhoneNumber: string | null;
}

/** GET /admin/order/detail 응답 */
export interface OrderDetail extends OrderListItem {
  performanceId: number;
  performanceTitle: string;
  enableDate: string | null;
  ticketOrderStatus: TicketOrderStatus;
  /** order 의 할인 종류/값으로 역산한 추정치 (원가는 저장되지 않는다) */
  discountAmount: number;
  finalPaymentAmount: number;
  /** 누적 취소 금액. 취소 이력이 없으면 0 */
  refundAmount: number;
  refundAt: string | null;
}

/** PATCH /admin/order/{orderId}/refund body */
export interface OrderRefundRequest {
  /**
   * 환불 금액.
   * ⚠️ 백엔드가 "관람일까지 남은 일수 기준 환불 정책으로 계산된 예상 환불액과
   * 일치해야 한다" 고 검증한다. 예상액을 바로 알려주는 관리자용 API 는 아직 없고
   * `GET /order/ticket/{paymentId}/cancel-amount` 는 본인 주문만 조회 가능하다.
   * 대신 `GET /notice/refund-policy` 의 비율표를 화면에 띄워 운영자가 계산한다.
   */
  amount: number;
  taxFreeAmount?: number;
  vatAmount?: number;
  /** PortOne 취소 기록에 남는다 */
  reason: string;
}

/** PATCH /admin/order/{orderId}/refund 응답 */
export interface OrderRefundResult {
  paymentId: string;
  /** 부분 취소든 전체 취소든 성공하면 항상 CANCEL */
  status: TicketOrderStatus;
  /** 실제로 환불된 금액 */
  refundAmount: number;
  /** 취소 수수료 — 환불 정책상 공제된 금액 (별도 정률 수수료가 아니다) */
  cancelFeeAmount: number;
  /** 결제수단 대분류 라벨 (예: "카드"). 무료 주문이면 null */
  refundMethod: string | null;
  /** 환불 처리 예상 기간 안내 문구. 정해지지 않았으면 null */
  expectedRefundPeriod: string | null;
  cancelledAt: string | null;
}

/* ------------------------------------------------------------------ *
 * 환불 비율 정책 (GET /notice/refund-policy)
 * 실제 환불액 계산에 쓰이는 상수를 그대로 노출해 주는 공개 endpoint 다.
 * 관리자 환불 폼에서 "지금 취소하면 몇 % 환불" 을 운영자가 직접 대조하는 데 쓴다.
 * ------------------------------------------------------------------ */

export interface RefundPolicyTier {
  /** 사람이 읽는 구간 설명 */
  label: string;
  minDaysUntilPerformance: number;
  /** 상한이 없는 최상위 티어는 null */
  maxDaysUntilPerformance: number | null;
  refundPercent: number;
}

export interface RefundPolicy {
  /** 남은 일수가 큰 구간부터 */
  tiers: RefundPolicyTier[];
  /** 공연 시작 이후 취소 시 환불 비율(%) — 항상 0 */
  afterPerformanceStartedPercent: number;
  /** 예매 후 이 시간(시간) 이내 취소면 유예 예외 대상 */
  gracePeriodHours: number;
  /** 유예 예외가 적용되려면 관람일까지 최소 이만큼(일) 남아 있어야 한다 */
  gracePeriodMinDaysBeforePerformance: number;
  /** 취소/환불 공지에 자동으로 덧붙는 것과 동일한 안내 문구 */
  description: string | null;
}

/** 관람일까지 남은 일수에 해당하는 티어. 해당 구간이 없으면 null */
export function tierForDaysLeft(
  policy: RefundPolicy,
  daysLeft: number,
): RefundPolicyTier | null {
  return (
    policy.tiers.find(
      (t) =>
        daysLeft >= t.minDaysUntilPerformance &&
        (t.maxDaysUntilPerformance == null || daysLeft <= t.maxDaysUntilPerformance),
    ) ?? null
  );
}

/** GET /admin/order/list 쿼리 파라미터 */
export interface OrderListQuery {
  memberId: number;
  cursorId: number;
}

/** PENDING 만 취소(cancel) 대상. SUCCESS 는 환불(refund) 로 처리한다. */
export function canCancel(status: TicketOrderStatus): boolean {
  return status === TicketOrderStatus.PENDING;
}

export function canRefund(status: TicketOrderStatus): boolean {
  return status === TicketOrderStatus.SUCCESS;
}

/** 아직 환불되지 않고 남아 있는 결제 금액 */
export function remainingAmount(order: OrderDetail): number {
  return Math.max(0, order.finalPaymentAmount - order.refundAmount);
}
