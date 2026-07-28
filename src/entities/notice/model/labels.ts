import { NoticeType } from "./types";

export const noticeTypeLabel: Record<NoticeType, string> = {
  [NoticeType.CANCEL_REFUND_FREE]: "취소·환불 규정 (무료 공연)",
  [NoticeType.CANCEL_REFUND_PAID]: "취소·환불 규정 (유료 공연)",
  [NoticeType.SETTLEMENT_GUIDE]: "정산 방법 안내",
};

export const noticeTypeDescription: Record<NoticeType, string> = {
  [NoticeType.CANCEL_REFUND_FREE]: "가격이 0원이거나 미설정인 공연의 예매 화면에 노출됩니다.",
  [NoticeType.CANCEL_REFUND_PAID]: "유료 공연의 예매 화면에 노출됩니다.",
  [NoticeType.SETTLEMENT_GUIDE]: "크리에이터 정산 화면에 노출됩니다.",
};
