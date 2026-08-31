import { FailedEventStatus, FailedEventType } from "./types";

export const failedEventStatusLabel: Record<FailedEventStatus, string> = {
  [FailedEventStatus.RECEIVED]: "수신됨",
  [FailedEventStatus.DONE]: "처리 완료",
  [FailedEventStatus.FAILED]: "실패",
  [FailedEventStatus.IGNORED]: "확인 완료",
};

export const failedEventStatusVariant = {
  [FailedEventStatus.RECEIVED]: "outline",
  [FailedEventStatus.DONE]: "success",
  [FailedEventStatus.FAILED]: "destructive",
  [FailedEventStatus.IGNORED]: "muted",
} as const satisfies Record<FailedEventStatus, string>;

export const failedEventTypeLabel: Record<FailedEventType, string> = {
  [FailedEventType.MEMBER_UPDATE]: "회원 정보 갱신",
  [FailedEventType.MEMBER_DELETE]: "회원 삭제",
  [FailedEventType.REPORT_PROCESSED_MAIL]: "신고 처리 메일",
  [FailedEventType.MEMBER_REJECTED_MAIL]: "가입 거절 메일",
  [FailedEventType.MAINTENANCE_REDIS_EVICT]: "점검 캐시 무효화",
  [FailedEventType.PLATFORM_PARTNER_REGISTER]: "PG 파트너 등록",
  [FailedEventType.PLATFORM_PARTNER_UPDATE]: "PG 파트너 수정",
  [FailedEventType.PLATFORM_PARTNER_CONTACT_SYNC]: "PG 파트너 연락처 동기화",
  [FailedEventType.INQUIRY_CREATED_SLACK]: "문의 접수 Slack 알림",
  [FailedEventType.TICKET_NOTIFICATION]: "예매 알림",
  [FailedEventType.USER_LOG]: "사용자 로그",
  [FailedEventType.R2_OBJECT_UPLOAD]: "이미지 업로드",
  [FailedEventType.SETTLEMENT_TRANSFER]: "정산 이체",
  [FailedEventType.PERFORMANCE_DETAIL_CACHE_EVICT]: "공연 상세 캐시 무효화",
  [FailedEventType.CONSENT_DOCUMENT_CACHE_EVICT]: "약관 본문 캐시 무효화",
};

/** 백엔드가 타입을 추가해도 화면이 깨지지 않도록 미지의 값은 코드를 그대로 보여준다 */
export function formatEventType(type: string): string {
  return failedEventTypeLabel[type as FailedEventType] ?? type;
}
