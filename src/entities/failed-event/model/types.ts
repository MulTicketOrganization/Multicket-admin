/**
 * 이벤트 처리 이력(inbox_event) 도메인.
 * 출처: /admin/failed-event/* (Admin 태그)
 *
 * 백엔드가 옛 `failed_event` 테이블을 outbox → CDC → RabbitMQ → `inbox_event`
 * 파이프라인으로 완전히 갈아엎었다. URL 은 하위 호환으로 유지됐지만 응답 스키마는
 * 전부 바뀌었다 — 이제 실패 건만이 아니라 파이프라인을 지나간 모든 이벤트가 보인다.
 */

export const FailedEventStatus = {
  /** 수신됨 — 아직 컨슈머가 처리하지 않았다 */
  RECEIVED: "RECEIVED",
  /** 처리 완료 */
  DONE: "DONE",
  /** 처리 실패 — 재실행/확인 처리 대상 */
  FAILED: "FAILED",
  /** 관리자가 재실행 없이 확인만 하고 닫은 건 */
  IGNORED: "IGNORED",
} as const;
export type FailedEventStatus =
  (typeof FailedEventStatus)[keyof typeof FailedEventStatus];

export const FailedEventType = {
  MEMBER_UPDATE: "MEMBER_UPDATE",
  MEMBER_DELETE: "MEMBER_DELETE",
  REPORT_PROCESSED_MAIL: "REPORT_PROCESSED_MAIL",
  MEMBER_REJECTED_MAIL: "MEMBER_REJECTED_MAIL",
  MAINTENANCE_REDIS_EVICT: "MAINTENANCE_REDIS_EVICT",
  PLATFORM_PARTNER_REGISTER: "PLATFORM_PARTNER_REGISTER",
  PLATFORM_PARTNER_UPDATE: "PLATFORM_PARTNER_UPDATE",
  PLATFORM_PARTNER_CONTACT_SYNC: "PLATFORM_PARTNER_CONTACT_SYNC",
  INQUIRY_CREATED_SLACK: "INQUIRY_CREATED_SLACK",
  TICKET_NOTIFICATION: "TICKET_NOTIFICATION",
  USER_LOG: "USER_LOG",
  R2_OBJECT_UPLOAD: "R2_OBJECT_UPLOAD",
  SETTLEMENT_TRANSFER: "SETTLEMENT_TRANSFER",
  PERFORMANCE_DETAIL_CACHE_EVICT: "PERFORMANCE_DETAIL_CACHE_EVICT",
  CONSENT_DOCUMENT_CACHE_EVICT: "CONSENT_DOCUMENT_CACHE_EVICT",
} as const;
export type FailedEventType =
  (typeof FailedEventType)[keyof typeof FailedEventType];

/** GET /admin/failed-event/list 응답 항목 */
export interface FailedEventListItem {
  id: number;
  /** outbox event_id (UUID) — 백엔드 로그와 대조할 때 쓰는 값 */
  eventId: string | null;
  eventType: FailedEventType;
  status: FailedEventStatus;
  /** outbox_event 발생 시각 */
  occurredAt: string | null;
}

/** GET /admin/failed-event/{id} 응답 */
export interface FailedEventDetail extends FailedEventListItem {
  /** FAILED 가 아니면 null */
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
 * 백엔드가 "재호출해도 안전하다고 확인된" 타입만 허용하고 나머지는 400 으로 거부한다.
 */
export const RETRYABLE_EVENT_TYPES: readonly FailedEventType[] = [
  FailedEventType.MEMBER_UPDATE,
  FailedEventType.MEMBER_DELETE,
  FailedEventType.R2_OBJECT_UPLOAD,
  FailedEventType.SETTLEMENT_TRANSFER,
  FailedEventType.MAINTENANCE_REDIS_EVICT,
  FailedEventType.INQUIRY_CREATED_SLACK,
  FailedEventType.PERFORMANCE_DETAIL_CACHE_EVICT,
];

/** 재실행·확인 처리는 둘 다 FAILED 상태에서만 열린다 (그 외는 백엔드가 400) */
export function isActionable(status: FailedEventStatus): boolean {
  return status === FailedEventStatus.FAILED;
}

export function isRetryable(event: {
  eventType: FailedEventType;
  status: FailedEventStatus;
}): boolean {
  return (
    isActionable(event.status) && RETRYABLE_EVENT_TYPES.includes(event.eventType)
  );
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
