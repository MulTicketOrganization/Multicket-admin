/**
 * 정산(Settlement) 도메인.
 * 출처: /admin/settlement/** (Admin 태그)
 *
 * 정산 행은 회차(ticketDate) 단위로 생성되며, 생성 시점의 공연·회차 정보를
 * 스냅샷으로 들고 있다. 상태는 PENDING → SUCCESS / FAIL 이고
 * PENDING→SUCCESS · PENDING→FAIL · FAIL→SUCCESS(재처리) 전이만 허용된다.
 */

export const SettlementStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAIL: "FAIL",
} as const;
export type SettlementStatus = (typeof SettlementStatus)[keyof typeof SettlementStatus];

/** GET /admin/settlement/list 응답 항목 */
export interface SettlementListItem {
  id: number;
  performanceId: number;
  performanceTitle: string;
  creatorId: number;
  creatorNickName: string;
  status: SettlementStatus;
  createDate: string;
}

/** GET /admin/settlement/{id} 응답 */
export interface SettlementDetail {
  id: number;
  performanceId: number;
  performanceTitle: string;
  venueName: string | null;
  /** 생성 시점의 회차 일시 스냅샷 */
  enableDate: string | null;
  creatorId: number;
  creatorNickName: string;
  creatorEmail: string;
  /** 최종 정산 금액 (finalAmount 와 같은 값) */
  settlementAmount: number;
  settlementDate: string | null;
  totalSuccessAmount: number;
  totalCancelAmount: number;
  feeRatePercent: number;
  feeAmount: number;
  finalAmount: number;
  /** SUCCESS 로 전이된 뒤에만 채워진다. null 이면 아직 이체 전 */
  portoneTransferId: string | null;
  status: SettlementStatus;
  successAt: string | null;
  createDate: string;
}

/** GET /admin/settlement/list 쿼리 파라미터 */
export interface SettlementListQuery {
  cursorId: number;
  /** yyyy-MM-dd — 해당 날짜에 생성된 정산만 */
  createDate?: string;
  /** 정산 대상 창작자의 닉네임·이메일 부분 일치 */
  keyword?: string;
  status?: SettlementStatus;
}

/** 이체 요청을 보낼 수 있는 상태인지 (이미 성공한 건은 재요청 대상이 아니다) */
export function canRequestTransfer(status: SettlementStatus): boolean {
  return status !== SettlementStatus.SUCCESS;
}
