/**
 * 공고(Notice) 도메인.
 *
 * 관리자 CRUD 는 `/admin/notice**`, 사용자 노출 확인은 공용 `GET /notice`,
 * `GET /notice/list`, `GET /notice/urgent` 를 쓴다.
 *
 * 2026-08 백엔드 변경 반영:
 * - `title` 이 필수로 추가됨
 * - `expireDate` 가 **모든 타입 공통 필수**로 바뀜 (이전에는 폴링 타입만)
 * - `MAINTENANCE`(서버 점검) 타입 신설 — `maintenanceStartDate` 필수
 * - `APP_UPDATE` 에 `updatePolicy`(RECOMMENDED/FORCED) 필수
 * - `APP_UPDATE`/`URGENT`/`MAINTENANCE` 에 `targetPlatforms` 필수
 * - `GET /notice/urgent` 가 단건이 아니라 **배열**을 돌려줌
 */

export const NoticeType = {
  CANCEL_REFUND_FREE: "CANCEL_REFUND_FREE",
  CANCEL_REFUND_PAID: "CANCEL_REFUND_PAID",
  SETTLEMENT_GUIDE: "SETTLEMENT_GUIDE",
  APP_UPDATE: "APP_UPDATE",
  URGENT: "URGENT",
  MAINTENANCE: "MAINTENANCE",
} as const;
export type NoticeType = (typeof NoticeType)[keyof typeof NoticeType];

/** 앱 업데이트 강제/권장 */
export const UpdatePolicy = {
  RECOMMENDED: "RECOMMENDED",
  FORCED: "FORCED",
} as const;
export type UpdatePolicy = (typeof UpdatePolicy)[keyof typeof UpdatePolicy];

/** 공고 노출 대상 플랫폼 */
export const NoticePlatform = {
  IOS: "IOS",
  ANDROID: "ANDROID",
  WEB: "WEB",
  ALL: "ALL",
} as const;
export type NoticePlatform = (typeof NoticePlatform)[keyof typeof NoticePlatform];

/**
 * 앱이 `GET /notice/urgent` 로 폴링해 가는 타입.
 * 이 셋만 `targetPlatforms` 를 요구한다.
 */
export const POLLING_NOTICE_TYPES: readonly NoticeType[] = [
  NoticeType.APP_UPDATE,
  NoticeType.URGENT,
  NoticeType.MAINTENANCE,
];

/** 상시 공고 — 앱의 특정 화면에서 최신 1건을 직접 조회해 간다 */
export const STANDING_NOTICE_TYPES: readonly NoticeType[] = [
  NoticeType.CANCEL_REFUND_FREE,
  NoticeType.CANCEL_REFUND_PAID,
  NoticeType.SETTLEMENT_GUIDE,
];

export function requiresTargetPlatforms(type: NoticeType): boolean {
  return POLLING_NOTICE_TYPES.includes(type);
}

export function requiresUpdatePolicy(type: NoticeType): boolean {
  return type === NoticeType.APP_UPDATE;
}

export function requiresMaintenanceStart(type: NoticeType): boolean {
  return type === NoticeType.MAINTENANCE;
}

/** GET /admin/notice 목록 항목 (본문 없음 — 상세에서 받는다) */
export interface NoticeListItem {
  id: number;
  type: NoticeType;
  title: string;
  /** 마이그레이션 이전 공고는 null */
  writerId: number | null;
  writerEmail: string | null;
  createDate: string;
  expireDate: string | null;
}

/** GET /admin/notice/{id} 응답 */
export interface NoticeDetail {
  id: number;
  type: NoticeType;
  title: string;
  content: string;
  expireDate: string | null;
  /** MAINTENANCE 타입만 값이 있다 */
  maintenanceStartDate: string | null;
  /** APP_UPDATE 타입만 값이 있다 */
  updatePolicy: UpdatePolicy | null;
  targetPlatforms: NoticePlatform[] | null;
  writerId: number | null;
  writerEmail: string | null;
  createDate: string;
  updateDate: string | null;
}

/** 공용 `GET /notice` · `GET /notice/urgent` 응답 (사용자에게 실제로 나가는 형태) */
export interface PublicNotice {
  id: number;
  type: NoticeType;
  title: string;
  content: string;
  createDate: string;
  expireDate: string | null;
  maintenanceStartDate: string | null;
  updatePolicy: UpdatePolicy | null;
  targetPlatforms: NoticePlatform[] | null;
}

/** POST /admin/notice · PATCH /admin/notice/{id} body (동일 스키마) */
export interface NoticeWriteRequest {
  type: NoticeType;
  title: string;
  content: string;
  /** ISO LocalDateTime — 모든 타입 공통 필수 */
  expireDate: string;
  /** APP_UPDATE 만 */
  updatePolicy?: UpdatePolicy;
  /** APP_UPDATE / URGENT / MAINTENANCE 만 */
  targetPlatforms?: NoticePlatform[];
  /** MAINTENANCE 만 */
  maintenanceStartDate?: string;
}

/** GET /admin/notice 쿼리 파라미터 */
export interface NoticeListQuery {
  cursorId: number;
  type?: NoticeType;
  /** yyyy-MM-dd — 해당 날짜에 만료되는 공고만 */
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

/**
 * 폼 입력이 타입별 필수 조건을 만족하는지.
 * 백엔드가 400 으로 거부하기 전에 버튼을 잠그는 용도.
 */
export function validateNoticeDraft(draft: {
  type: NoticeType;
  title: string;
  content: string;
  expireDate: string;
  updatePolicy?: UpdatePolicy;
  targetPlatforms?: NoticePlatform[];
  maintenanceStartDate?: string;
}): string | null {
  if (!draft.title.trim()) return "제목을 입력하세요.";
  if (!draft.content.trim()) return "내용을 입력하세요.";
  if (!draft.expireDate) return "만료 시각을 입력하세요.";
  if (requiresUpdatePolicy(draft.type) && !draft.updatePolicy) {
    return "앱 업데이트 공고는 강제/권장 여부를 골라야 합니다.";
  }
  if (requiresTargetPlatforms(draft.type) && !draft.targetPlatforms?.length) {
    return "대상 플랫폼을 하나 이상 골라야 합니다.";
  }
  if (requiresMaintenanceStart(draft.type) && !draft.maintenanceStartDate) {
    return "점검 시작 일시를 입력하세요.";
  }
  if (
    requiresMaintenanceStart(draft.type) &&
    draft.maintenanceStartDate &&
    new Date(draft.maintenanceStartDate).getTime() >= new Date(draft.expireDate).getTime()
  ) {
    return "점검 종료(만료) 시각은 시작 일시보다 뒤여야 합니다.";
  }
  return null;
}
