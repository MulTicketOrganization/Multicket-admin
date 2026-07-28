/**
 * 회원 도메인 enum / 타입.
 * 출처: https://multicket.duckdns.org/v3/api-docs (Admin 태그)
 * 모든 enum 은 `as const` 객체 + union type 패턴으로 정의 (tree-shake 친화적).
 */

export const MemberType = {
  AUDIENCE: "AUDIENCE",
  CREATOR: "CREATOR",
  MASTER: "MASTER",
} as const;
export type MemberType = (typeof MemberType)[keyof typeof MemberType];

export const MemberStatus = {
  PENDING: "PENDING",
  COMPLETE: "COMPLETE",
  FROZEN: "FROZEN",
  BANNED: "BANNED",
  DELETED: "DELETED",
} as const;
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];

/**
 * 회원 상태 "전이 이벤트".
 * 백엔드는 목표 상태가 아니라 이벤트를 받는다 —
 * 현재 상태에서 허용되지 않는 이벤트는 400 으로 거부된다.
 */
export const MemberEvent = {
  APPROVE: "APPROVE",
  FREEZE: "FREEZE",
  UNFREEZE: "UNFREEZE",
  BAN: "BAN",
  DELETE: "DELETE",
} as const;
export type MemberEvent = (typeof MemberEvent)[keyof typeof MemberEvent];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  NONE: "NONE",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const LoginType = {
  LOCAL: "LOCAL",
  GOOGLE: "GOOGLE",
  KAKAO: "KAKAO",
  NAVER: "NAVER",
} as const;
export type LoginType = (typeof LoginType)[keyof typeof LoginType];

/** GET /admin/member/list 응답 항목 */
export interface MemberListItem {
  id: number;
  nickName: string;
  email: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  loginType: LoginType;
  deleted: boolean;
  createDate: string;
  lastLoginAt: string | null;
}

/** GET /admin/member/detail 응답 */
export interface MemberDetail {
  id: number;
  nickName: string;
  email: string;
  profileUrl: string | null;
  gender: Gender | null;
  loginType: LoginType;
  memberType: MemberType;
  memberStatus: MemberStatus;
  year: number | null;
  month: number | null;
  day: number | null;
  deleted: boolean;
  lastLoginAt: string | null;
  createDate: string;
  updateDate: string;
  /** 선호 장르 목록 */
  genres?: string[] | null;
  /** 선호 지역 */
  area?: string | null;
}

/** GET /admin/member/list 쿼리 파라미터 */
export interface MemberListQuery {
  cursorId: number;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  keyword?: string;
}

/** POST /admin/member/change body */
export interface MemberChangeRequest {
  memberId: number;
  event: MemberEvent;
}

/**
 * 현재 상태에서 적용 가능한 이벤트.
 * 백엔드 전이 규칙을 UI 에서 미리 좁혀 400 을 줄인다 (최종 판단은 서버).
 */
export const ALLOWED_MEMBER_EVENTS: Record<MemberStatus, MemberEvent[]> = {
  [MemberStatus.PENDING]: [MemberEvent.APPROVE, MemberEvent.BAN, MemberEvent.DELETE],
  [MemberStatus.COMPLETE]: [MemberEvent.FREEZE, MemberEvent.BAN, MemberEvent.DELETE],
  [MemberStatus.FROZEN]: [MemberEvent.UNFREEZE, MemberEvent.BAN, MemberEvent.DELETE],
  [MemberStatus.BANNED]: [MemberEvent.UNFREEZE, MemberEvent.DELETE],
  [MemberStatus.DELETED]: [],
};
