import { NoticeType } from "./types";

export const noticeTypeLabel: Record<NoticeType, string> = {
  [NoticeType.CANCEL_REFUND_FREE]: "취소·환불 규정 (무료 공연)",
  [NoticeType.CANCEL_REFUND_PAID]: "취소·환불 규정 (유료 공연)",
  [NoticeType.SETTLEMENT_GUIDE]: "정산 방법 안내",
  [NoticeType.APP_UPDATE]: "앱 업데이트 안내",
  [NoticeType.URGENT]: "긴급 점검 안내",
};

export const noticeTypeDescription: Record<NoticeType, string> = {
  [NoticeType.CANCEL_REFUND_FREE]: "가격이 0원이거나 미설정인 공연의 예매 화면에 노출됩니다.",
  [NoticeType.CANCEL_REFUND_PAID]: "유료 공연의 예매 화면에 노출됩니다.",
  [NoticeType.SETTLEMENT_GUIDE]: "크리에이터 정산 화면에 노출됩니다.",
  [NoticeType.APP_UPDATE]:
    "앱이 폴링으로 가져가 업데이트 안내를 띄웁니다. 만료 시각까지만 노출되며, 버전 번호나 강제 업데이트 여부는 백엔드에 필드가 없어 문구로만 안내할 수 있습니다.",
  [NoticeType.URGENT]:
    "앱이 폴링으로 가져가 긴급 점검 안내를 띄웁니다. 만료 시각이 지나야 사라지므로 즉시 해제나 플랫폼(iOS/Android)별 노출은 아직 불가능합니다.",
};
