import { ReportEvent, ReportReason, ReportStatus } from "./types";

export const reportReasonLabel: Record<ReportReason, string> = {
  [ReportReason.COPYRIGHT_INFRINGEMENT]: "저작권 침해",
  [ReportReason.FRAUD_OR_FALSE_INFORMATION]: "사기 · 허위 정보",
  [ReportReason.INAPPROPRIATE_CONTENT]: "부적절한 콘텐츠",
  [ReportReason.SPAM]: "스팸",
  [ReportReason.ETC]: "기타",
};

/** 백엔드가 사유를 추가해도 화면이 깨지지 않도록 미지의 값은 코드를 그대로 보여준다 */
export function formatReportReason(reason: string): string {
  return reportReasonLabel[reason as ReportReason] ?? reason;
}

export const reportStatusLabel: Record<ReportStatus, string> = {
  [ReportStatus.PENDING]: "접수",
  [ReportStatus.COMPLETED]: "처리 완료",
  [ReportStatus.REJECTED]: "반려",
};

export const reportStatusVariant = {
  [ReportStatus.PENDING]: "warning",
  [ReportStatus.COMPLETED]: "success",
  [ReportStatus.REJECTED]: "muted",
} as const satisfies Record<ReportStatus, string>;

export const reportEventLabel: Record<ReportEvent, string> = {
  [ReportEvent.COMPLETE]: "처리 완료",
  [ReportEvent.REJECT]: "반려",
};

export const reportEventDescription: Record<ReportEvent, string> = {
  [ReportEvent.COMPLETE]:
    "신고를 수용하고 처리 완료로 종료합니다. 공연 삭제 등 실제 조치는 공연 관리에서 별도로 진행해야 합니다.",
  [ReportEvent.REJECT]: "신고를 반려하고 종료합니다. 공연에는 아무 변화가 없습니다.",
};
