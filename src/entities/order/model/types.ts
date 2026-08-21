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
   * 일치해야 한다" 고 검증하는데, 그 값을 조회할 API 가 없어 운영자가 직접 넣는다.
   */
  amount: number;
  taxFreeAmount?: number;
  vatAmount?: number;
  /** PortOne 취소 기록에 남는다 */
  reason: string;
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
