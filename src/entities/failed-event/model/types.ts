/**
 * 실패 이벤트(DLQ) 도메인.
 * 출처: /admin/failed-event/* (Admin 태그)
 *
 * 메시지 컨슈머가 처리에 실패해 DLQ 로 빠진 건들이다.
 * payload 를 그대로 보관하고 있어 일부 타입은 재실행이 가능하다.
 */

export const FailedEventStatus = {
  PENDING: "PENDING",
  COMPLETE: "COMPLETE",
} as const;
export type FailedEventStatus =
  (typeof FailedEventStatus)[keyof typeof FailedEventStatus];

export const FailedEventType = {
  USER_LOG: "USER_LOG",
  TICKET_NOTIFICATION_ACCEPT: "TICKET_NOTIFICATION_ACCEPT",
  TICKET_NOTIFICATION_MEMBER_CANCEL: "TICKET_NOTIFICATION_MEMBER_CANCEL",
  TICKET_NOTIFICATION_OWNER_CANCEL: "TICKET_NOTIFICATION_OWNER_CANCEL",
  TICKET_NOTIFICATION_PAYMENT_FAIL: "TICKET_NOTIFICATION_PAYMENT_FAIL",
  MEMBER_UPDATE: "MEMBER_UPDATE",
  MEMBER_DELETE: "MEMBER_DELETE",
  SETTLEMENT_TRANSFER: "SETTLEMENT_TRANSFER",
  R2_OBJECT_UPLOAD: "R2_OBJECT_UPLOAD",
  UNKNOWN: "UNKNOWN",
} as const;
export type FailedEventType =
  (typeof FailedEventType)[keyof typeof FailedEventType];

/** GET /admin/failed-event/list 응답 항목 */
export interface FailedEventListItem {
  id: number;
  eventType: FailedEventType;
  target: string | null;
  originQueue: string | null;
  status: FailedEventStatus;
  /** DLQ 최종 기록 시각 */
  occurredAt: string | null;
}

/** GET /admin/failed-event/{id} 응답 */
export interface FailedEventDetail extends FailedEventListItem {
  description: string | null;
  failureReason: string | null;
  /** DB 저장 시각 */
  createDate: string | null;
  /** JSON 으로 파싱되면 객체, 아니면 원본 문자열 그대로 */
  payload: unknown;
}

/** GET /admin/failed-event/list 쿼리 파라미터 */
export interface FailedEventListQuery {
  cursorId: number;
  status?: FailedEventStatus;
  eventType?: FailedEventType;
}

/**
 * 재실행(retry) 을 지원하는 이벤트 타입.
 * 백엔드가 "재호출해도 안전하다고 확인된" 네 타입만 허용하고 나머지는 400 으로 거부한다.
 */
export const RETRYABLE_EVENT_TYPES: readonly FailedEventType[] = [
  FailedEventType.SETTLEMENT_TRANSFER,
  FailedEventType.R2_OBJECT_UPLOAD,
  FailedEventType.MEMBER_UPDATE,
  FailedEventType.MEMBER_DELETE,
];

export function isRetryable(event: {
  eventType: FailedEventType;
  status: FailedEventStatus;
}): boolean {
  return (
    event.status === FailedEventStatus.PENDING &&
    RETRYABLE_EVENT_TYPES.includes(event.eventType)
  );
}

/** COMPLETE 로 넘어간 건은 어떤 조작도 할 수 없다 */
export function isFailedEventClosed(status: FailedEventStatus): boolean {
  return status === FailedEventStatus.COMPLETE;
}

/** payload 를 화면에 보여주기 위한 문자열 변환 (객체면 pretty-print) */
export function formatPayload(payload: unknown): string {
  if (payload == null) return "-";
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}
