import { ConsentType } from "./types";

export const consentTypeLabel: Record<ConsentType, string> = {
  [ConsentType.SERVICE_TERMS]: "서비스 이용약관",
  [ConsentType.PRIVACY_POLICY]: "개인정보 처리방침",
  [ConsentType.AGE_OVER_14]: "만 14세 이상 확인",
  [ConsentType.MARKETING]: "마케팅 정보 수신",
};

export const consentTypeDescription: Record<ConsentType, string> = {
  [ConsentType.SERVICE_TERMS]: "가입 필수. 온보딩에서 동의를 받습니다.",
  [ConsentType.PRIVACY_POLICY]: "가입 필수. 온보딩에서 동의를 받습니다.",
  [ConsentType.AGE_OVER_14]: "가입 필수. 온보딩에서 동의를 받습니다.",
  [ConsentType.MARKETING]: "선택 항목. 가입 후에도 마이페이지에서 재동의·철회할 수 있습니다.",
};
