import { ReportEvent, ReportStatus } from "./types";

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
