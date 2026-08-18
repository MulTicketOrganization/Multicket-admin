/**
 * 공고(Notice) 도메인.
 * 등록은 POST /admin/notice, 조회는 공용 GET /notice · GET /notice/urgent 를 쓴다 —
 * admin 쪽에 공고 조회 endpoint 가 없기 때문.
 */

export const NoticeType = {
  CANCEL_REFUND_FREE: "CANCEL_REFUND_FREE",
  CANCEL_REFUND_PAID: "CANCEL_REFUND_PAID",
  SETTLEMENT_GUIDE: "SETTLEMENT_GUIDE",
  APP_UPDATE: "APP_UPDATE",
  URGENT: "URGENT",
} as const;
export type NoticeType = (typeof NoticeType)[keyof typeof NoticeType];

/**
 * expireDate 가 있어야 앱의 폴링 조회(GET /notice/urgent)에 노출되는 타입.
 * 나머지 타입은 만료 개념이 없어 값을 비워 보낸다.
 */
export const POLLING_NOTICE_TYPES: readonly NoticeType[] = [
  NoticeType.APP_UPDATE,
  NoticeType.URGENT,
];

export function requiresExpireDate(type: NoticeType): boolean {
  return POLLING_NOTICE_TYPES.includes(type);
}

/** GET /notice 응답 */
export interface Notice {
  id: number;
  type: NoticeType;
  content: string;
  createDate: string;
  /** APP_UPDATE / URGENT 타입만 값이 있다 */
  expireDate?: string | null;
}

/** POST /admin/notice body */
export interface NoticeCreateRequest {
  type: NoticeType;
  content: string;
  /** ISO LocalDateTime — APP_UPDATE / URGENT 에만 사용 */
  expireDate?: string;
}

/** 만료 시각이 지났는지 (게시 중 여부 표시용) */
export function isNoticeExpired(
  expireDate: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!expireDate) return false;
  const d = new Date(expireDate);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() <= now.getTime();
}
