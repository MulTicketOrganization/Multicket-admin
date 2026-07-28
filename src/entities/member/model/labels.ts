import { Gender, LoginType, MemberEvent, MemberStatus, MemberType } from "./types";

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
  [MemberStatus.BANNED]: "정지",
  [MemberStatus.DELETED]: "탈퇴",
};

/**
 * 상태 → Badge variant.
 * 무채색 테마라 색 대신 명도로 구분되지만, 위험 상태(정지/동결)만 destructive 로 남긴다.
 */
export const memberStatusVariant = {
  [MemberStatus.COMPLETE]: "success",
  [MemberStatus.PENDING]: "warning",
  [MemberStatus.FROZEN]: "destructive",
  [MemberStatus.BANNED]: "destructive",
  [MemberStatus.DELETED]: "muted",
} as const satisfies Record<MemberStatus, string>;

export const memberTypeVariant = {
  [MemberType.MASTER]: "default",
  [MemberType.CREATOR]: "secondary",
  [MemberType.AUDIENCE]: "muted",
} as const satisfies Record<MemberType, string>;

export const memberEventLabel: Record<MemberEvent, string> = {
  [MemberEvent.APPROVE]: "가입 승인",
  [MemberEvent.FREEZE]: "동결",
  [MemberEvent.UNFREEZE]: "동결 해제",
  [MemberEvent.BAN]: "정지",
  [MemberEvent.DELETE]: "삭제",
};

/** 각 이벤트가 무엇을 하는지 한 줄 설명 (다이얼로그용) */
export const memberEventDescription: Record<MemberEvent, string> = {
  [MemberEvent.APPROVE]: "가입 대기 중인 회원을 가입 완료 상태로 전환합니다.",
  [MemberEvent.FREEZE]: "회원을 동결하여 서비스 이용을 일시 중단시킵니다.",
  [MemberEvent.UNFREEZE]: "동결·정지된 회원을 가입 완료 상태로 되돌립니다.",
  [MemberEvent.BAN]: "회원을 영구 정지합니다.",
  [MemberEvent.DELETE]: "회원을 삭제 처리합니다. 되돌릴 수 없습니다.",
};

/** 되돌릴 수 없는 파괴적 이벤트 — UI 에서 경고 표시 */
export const DESTRUCTIVE_MEMBER_EVENTS: readonly MemberEvent[] = [
  MemberEvent.BAN,
  MemberEvent.DELETE,
];

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
