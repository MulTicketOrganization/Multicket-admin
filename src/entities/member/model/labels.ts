import { Gender, LoginType, MemberStatus, MemberType } from "./types";

/** UI 표시용 한글 라벨 맵. */

export const memberTypeLabel: Record<MemberType, string> = {
  [MemberType.AUDIENCE]: "관객",
  [MemberType.CREATOR]: "크리에이터",
  [MemberType.MASTER]: "관리자",
};

export const memberStatusLabel: Record<MemberStatus, string> = {
  [MemberStatus.PENDING]: "가입 대기",
  [MemberStatus.COMPLETE]: "가입 완료",
  [MemberStatus.FROZEN]: "동결",
};

export const genderLabel: Record<Gender, string> = {
  [Gender.MALE]: "남성",
  [Gender.FEMALE]: "여성",
  [Gender.NONE]: "선택 안 함",
};

export const loginTypeLabel: Record<LoginType, string> = {
  [LoginType.LOCAL]: "이메일",
  [LoginType.GOOGLE]: "Google",
  [LoginType.KAKAO]: "Kakao",
  [LoginType.NAVER]: "Naver",
};
