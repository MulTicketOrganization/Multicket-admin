import { SettlementStatus } from "./types";

export const settlementStatusLabel: Record<SettlementStatus, string> = {
  [SettlementStatus.PENDING]: "정산 대기",
  [SettlementStatus.SUCCESS]: "정산 완료",
  [SettlementStatus.FAIL]: "정산 실패",
};

export const settlementStatusVariant = {
  [SettlementStatus.PENDING]: "warning",
  [SettlementStatus.SUCCESS]: "success",
  [SettlementStatus.FAIL]: "destructive",
} as const satisfies Record<SettlementStatus, string>;
