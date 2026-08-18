import { FailedEventStatus, FailedEventType } from "./types";

export const failedEventStatusLabel: Record<FailedEventStatus, string> = {
  [FailedEventStatus.PENDING]: "미확인",
  [FailedEventStatus.COMPLETE]: "확인 완료",
};

export const failedEventStatusVariant = {
  [FailedEventStatus.PENDING]: "warning",
  [FailedEventStatus.COMPLETE]: "muted",
} as const satisfies Record<FailedEventStatus, string>;

export const failedEventTypeLabel: Record<FailedEventType, string> = {
  [FailedEventType.USER_LOG]: "사용자 로그",
  [FailedEventType.TICKET_NOTIFICATION_ACCEPT]: "예매 완료 알림",
  [FailedEventType.TICKET_NOTIFICATION_MEMBER_CANCEL]: "회원 취소 알림",
  [FailedEventType.TICKET_NOTIFICATION_OWNER_CANCEL]: "주최자 취소 알림",
  [FailedEventType.TICKET_NOTIFICATION_PAYMENT_FAIL]: "결제 실패 알림",
  [FailedEventType.MEMBER_UPDATE]: "회원 정보 갱신",
  [FailedEventType.MEMBER_DELETE]: "회원 삭제",
  [FailedEventType.SETTLEMENT_TRANSFER]: "정산 이체",
  [FailedEventType.R2_OBJECT_UPLOAD]: "이미지 업로드",
  [FailedEventType.UNKNOWN]: "알 수 없음",
};
