import { TicketOrderStatus } from "./types";

export const orderStatusLabel: Record<TicketOrderStatus, string> = {
  [TicketOrderStatus.PENDING]: "결제 대기",
  [TicketOrderStatus.SUCCESS]: "결제 완료",
  [TicketOrderStatus.FAIL]: "결제 실패",
  [TicketOrderStatus.CANCEL]: "취소",
};

export const orderStatusVariant = {
  [TicketOrderStatus.PENDING]: "warning",
  [TicketOrderStatus.SUCCESS]: "success",
  [TicketOrderStatus.FAIL]: "muted",
  [TicketOrderStatus.CANCEL]: "muted",
} as const satisfies Record<TicketOrderStatus, string>;
