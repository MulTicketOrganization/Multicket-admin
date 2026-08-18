/**
 * 신고(Report) 도메인.
 * 출처: /admin/report/* (Admin 태그)
 *
 * 신고는 "공연"을 대상으로만 접수된다 (회원 신고는 없음).
 * 처리 상태는 PENDING → COMPLETED / REJECTED 3단계이며,
 * 기획서의 "검토중" 단계는 백엔드에 존재하지 않는다.
 */

export const ReportStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

/** 신고에 적용할 처리 이벤트 */
export const ReportEvent = {
  COMPLETE: "COMPLETE",
  REJECT: "REJECT",
} as const;
export type ReportEvent = (typeof ReportEvent)[keyof typeof ReportEvent];

/** GET /admin/report/list 응답 항목 */
export interface ReportListItem {
  id: number;
  performanceId: number;
  performanceTitle: string;
  reporterNickName: string;
  status: ReportStatus;
  createDate: string;
}

/** GET /admin/report/{id} 응답 */
export interface ReportDetail {
  id: number;
  reporterId: number;
  reporterNickName: string;
  reporterEmail: string;
  reason: string;
  status: ReportStatus;
  performanceId: number;
  performanceTitle: string;
  creatorId: number | null;
  creatorNickName: string | null;
  /** 처리 전에는 null */
  handledById: number | null;
  handledByNickName: string | null;
  /** 처리한 관리자의 소견 — 기획서의 "관리자 메모" */
  opinion: string | null;
  handledAt: string | null;
  createDate: string;
}

/** GET /admin/report/list 쿼리 파라미터 */
export interface ReportListQuery {
  cursorId: number;
  status?: ReportStatus;
  /** yyyy-MM-dd — 해당 날짜에 접수된 신고만 */
  createDate?: string;
  /** 특정 공연에 대한 신고만 */
  performanceId?: number;
}

/** PATCH /admin/report/{id} body */
export interface ReportProcessRequest {
  event: ReportEvent;
  /** 필수 — 백엔드가 빈 값을 거부한다 */
  opinion: string;
  /**
   * true 면 해당 공연의 창작자에게도 처리 결과 메일이 나간다.
   * 같은 공연에 중복 신고가 쌓였을 때 매번 메일이 가지 않도록 기본값은 false.
   */
  notifyCreator?: boolean;
}

/** 종료된 신고는 재처리 불가 (백엔드가 400 으로 거부) */
export function isReportClosed(status: ReportStatus): boolean {
  return status !== ReportStatus.PENDING;
}

/** 소견은 필수값이라 공백만 입력한 경우도 막는다 */
export const OPINION_MAX_LENGTH = 1000;

export function isValidOpinion(opinion: string): boolean {
  const trimmed = opinion.trim();
  return trimmed.length > 0 && trimmed.length <= OPINION_MAX_LENGTH;
}
