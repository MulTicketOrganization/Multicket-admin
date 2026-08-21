import { NoticePlatform, NoticeType, UpdatePolicy } from "./types";

export const noticeTypeLabel: Record<NoticeType, string> = {
  [NoticeType.CANCEL_REFUND_FREE]: "취소·환불 규정 (무료 공연)",
  [NoticeType.CANCEL_REFUND_PAID]: "취소·환불 규정 (유료 공연)",
  [NoticeType.SETTLEMENT_GUIDE]: "정산 방법 안내",
  [NoticeType.APP_UPDATE]: "앱 업데이트 안내",
  [NoticeType.URGENT]: "긴급 공지",
  [NoticeType.MAINTENANCE]: "서버 점검 안내",
};

export const noticeTypeDescription: Record<NoticeType, string> = {
  [NoticeType.CANCEL_REFUND_FREE]:
    "가격이 0원이거나 미설정인 공연의 예매·취소 화면에 노출됩니다.",
  [NoticeType.CANCEL_REFUND_PAID]: "유료 공연의 예매·취소 화면에 노출됩니다.",
  [NoticeType.SETTLEMENT_GUIDE]: "크리에이터 정산 화면에 노출됩니다.",
  [NoticeType.APP_UPDATE]:
    "앱이 폴링으로 가져가 업데이트 안내를 띄웁니다. 강제(FORCED)로 두면 사용자가 닫을 수 없는 안내가 됩니다.",
  [NoticeType.URGENT]: "앱이 폴링으로 가져가 긴급 공지를 띄웁니다. 만료 시각까지 노출됩니다.",
  [NoticeType.MAINTENANCE]:
    "점검 시작~만료 시각 사이에 앱이 점검 안내를 띄웁니다. 만료 시각이 곧 점검 종료 시각입니다.",
};

export const noticeTypeVariant = {
  [NoticeType.CANCEL_REFUND_FREE]: "muted",
  [NoticeType.CANCEL_REFUND_PAID]: "muted",
  [NoticeType.SETTLEMENT_GUIDE]: "muted",
  [NoticeType.APP_UPDATE]: "secondary",
  [NoticeType.URGENT]: "warning",
  [NoticeType.MAINTENANCE]: "warning",
} as const satisfies Record<NoticeType, string>;

export const updatePolicyLabel: Record<UpdatePolicy, string> = {
  [UpdatePolicy.RECOMMENDED]: "권장 업데이트",
  [UpdatePolicy.FORCED]: "강제 업데이트",
};

export const updatePolicyDescription: Record<UpdatePolicy, string> = {
  [UpdatePolicy.RECOMMENDED]: "사용자가 '나중에' 로 닫고 계속 사용할 수 있습니다.",
  [UpdatePolicy.FORCED]: "사용자가 닫을 수 없고 스토어로 이동해야만 앱을 쓸 수 있습니다.",
};

export const noticePlatformLabel: Record<NoticePlatform, string> = {
  [NoticePlatform.IOS]: "iOS",
  [NoticePlatform.ANDROID]: "Android",
  [NoticePlatform.WEB]: "Web",
  [NoticePlatform.ALL]: "전체",
};
